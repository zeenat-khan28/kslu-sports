import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import DetailedFormClient from './DetailedFormClient'
import { redirect } from 'next/navigation'
import { AlertTriangle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DetailedFormPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Use service role to reliably read data (RLS was silently failing on Vercel)
  const adminDb = createAdminClient()

  const { data: collegeEmail } = await adminDb
    .from('college_emails')
    .select('college_id')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!collegeEmail?.college_id) redirect('/college/dashboard')
  const collegeId = collegeEmail.college_id

  // 1. Check if Phase 1 is submitted
  const { data: initialSubmission } = await adminDb
    .from('initial_submissions')
    .select('*')
    .eq('college_id', collegeId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!initialSubmission) {
    return (
      <div className="max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Detailed Proforma</h1>
        <div className="p-6 bg-orange-50 border border-orange-200 rounded-md flex items-start text-orange-800">
          <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold">Initial Confirmation Required</h2>
            <p className="mt-1 text-sm">You must complete and submit your Phase 1 Initial Confirmation before accessing the detailed proformas.</p>
          </div>
        </div>
      </div>
    )
  }

  // 2. Check window status
  const { data: window } = await adminDb
    .from('portal_windows')
    .select('*')
    .eq('phase', 'detailed')
    .maybeSingle()

  const { data: extension } = await adminDb
    .from('college_window_extensions')
    .select('*')
    .eq('college_id', collegeId)
    .eq('phase', 'detailed')
    .maybeSingle()

  const now = new Date()
  let isOpen = false
  let statusMessage = "The detailed proforma window is closed."

  if (window?.manual_override === 'force_open') {
    isOpen = true
  } else if (window?.manual_override === 'force_close') {
    isOpen = false
    statusMessage = "The portal has been manually closed by the administrator."
  } else if (window?.opens_at && window?.closes_at) {
    const opens = new Date(window.opens_at)
    const closes = new Date(window.closes_at)
    if (now >= opens && now <= closes) {
      isOpen = true
    } else if (now < opens) {
      statusMessage = `The window will open on ${opens.toLocaleString('en-IN')}`
    } else {
      statusMessage = `The window closed on ${closes.toLocaleString('en-IN')}`
    }
  } else {
    statusMessage = "The portal schedule has not been set by the administrator yet."
  }

  if (extension && new Date(extension.extended_until) >= now && window?.manual_override !== 'force_close') {
    isOpen = true
    statusMessage = `You have been granted an extension until ${new Date(extension.extended_until).toLocaleString('en-IN')}`
  }

  // 3. Fetch Confirmed Sports (where participating = true)
  const { data: confirmedEvents } = await adminDb
    .from('initial_responses')
    .select('sport_event_id, sport_events(*, sports(*))')
    .eq('college_id', collegeId)
    .eq('participating', true)

  // 4. Fetch existing detailed forms
  const { data: detailedForms } = await adminDb
    .from('detailed_forms')
    .select('*')
    .eq('college_id', collegeId)

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Detailed Eligibility Proforma</h1>
        <p className="text-[var(--color-muted)] mt-1">Submit player details and generate PDFs for your confirmed sports.</p>
      </div>

      {!isOpen && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start text-red-800 text-sm">
          <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{statusMessage} You can view your forms but cannot edit them.</span>
        </div>
      )}

      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm">
        <DetailedFormClient 
          confirmedEvents={confirmedEvents || []} 
          existingForms={detailedForms || []} 
          collegeId={collegeId}
          isLocked={!isOpen}
        />
      </div>
    </div>
  )
}
