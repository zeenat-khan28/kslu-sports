import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PlayerFormClient from './PlayerFormClient'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DetailedProformaEditor({ params }: { params: { eventId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminDb = createAdminClient()

  const { data: collegeEmail } = await adminDb
    .from('college_emails')
    .select('college_id')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!collegeEmail?.college_id) redirect('/college/dashboard')
  const collegeId = collegeEmail.college_id

  const { data: event } = await adminDb
    .from('sport_events')
    .select('*, sports(*)')
    .eq('id', params.eventId)
    .maybeSingle()

  if (!event) redirect('/college/detailed-form')

  // Fetch window logic
  const { data: window } = await adminDb.from('portal_windows').select('*').eq('phase', 'detailed').maybeSingle()
  const { data: extension } = await adminDb.from('college_window_extensions').select('*').eq('college_id', collegeId).eq('phase', 'detailed').maybeSingle()
  
  const now = new Date()
  let isOpen = false
  if (window?.manual_override === 'force_open') isOpen = true
  else if (window?.manual_override === 'force_close') isOpen = false
  else if (window?.opens_at && window?.closes_at && now >= new Date(window.opens_at) && now <= new Date(window.closes_at)) isOpen = true
  if (extension && new Date(extension.extended_until) >= now && window?.manual_override !== 'force_close') isOpen = true

  // Fetch existing form and players
  const { data: form } = await adminDb.from('detailed_forms').select('*').eq('sport_event_id', event.id).eq('college_id', collegeId).maybeSingle()
  let players: any[] = []
  if (form) {
     const { data: pData } = await adminDb.from('detailed_players').select('*').eq('detailed_form_id', form.id).order('serial_no')
     players = pData || []
  }

  const isLocked = !isOpen || form?.status === 'submitted'

  return (
    <div className="max-w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/college/detailed-form" className="inline-flex items-center text-sm font-bold text-[var(--color-muted)] hover:text-[var(--color-kslu-maroon)] mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {event.sports.name} ({event.gender})
          </h1>
          <p className="text-[var(--color-muted)] mt-1">Fill in the eligibility proforma. Maximum 12 players.</p>
        </div>
      </div>

      <PlayerFormClient 
         eventId={event.id}
         collegeId={collegeId}
         existingForm={form}
         existingPlayers={players}
         isLocked={isLocked}
      />
    </div>
  )
}
