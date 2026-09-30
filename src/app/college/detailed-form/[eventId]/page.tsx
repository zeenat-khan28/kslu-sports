import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, Users } from 'lucide-react'

export default async function DetailedProformaEditor({ params }: { params: { eventId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('sport_events')
    .select('*, sports(*)')
    .eq('id', params.eventId)
    .single()

  if (!event) redirect('/college/detailed-form')

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/college/detailed-form" className="inline-flex items-center text-sm font-bold text-[var(--color-muted)] hover:text-[var(--color-kslu-maroon)] mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {event.sports.name} ({event.gender})
          </h1>
          <p className="text-[var(--color-muted)] mt-1">Maximum 12 players allowed.</p>
        </div>
        
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-[var(--color-border)] rounded bg-white font-bold text-[var(--color-text)] flex items-center hover:bg-gray-50">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </button>
          <button className="px-4 py-2 bg-[var(--color-kslu-green)] text-white rounded font-bold flex items-center hover:bg-[#164229]">
            <Upload className="w-4 h-4 mr-2" /> Final Submit
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm p-8 text-center">
         <Users className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4" />
         <h2 className="text-xl font-bold text-[var(--color-text)]">Player Entry Interface Coming Soon</h2>
         <p className="text-[var(--color-muted)] mt-2 max-w-lg mx-auto">
           The detailed player entry form (including photo uploads, academic details, and PDF generation) is currently being finalized for Milestone 6.
         </p>
      </div>
    </div>
  )
}
