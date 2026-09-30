import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle, Clock, AlertTriangle, FileText, ArrowRight } from 'lucide-react'

export default async function CollegeDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: collegeEmail } = await supabase
    .from('college_emails')
    .select('college_id, colleges(*)')
    .eq('auth_user_id', user?.id)
    .single()

  const collegeId = collegeEmail?.college_id

  // Fetch window status
  const { data: windows } = await supabase.from('portal_windows').select('*')
  const initialWindow = windows?.find(w => w.phase === 'initial')
  const detailedWindow = windows?.find(w => w.phase === 'detailed')

  // Check if Initial Form is submitted
  const { data: initialSubmission } = await supabase
    .from('initial_submissions')
    .select('id, created_at')
    .eq('college_id', collegeId)
    .single()

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Welcome, {(collegeEmail?.colleges as any)?.name}</h1>
        <p className="text-[var(--color-muted)] mt-1">Manage your sports participation for the 2025-26 academic year.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Initial Form Status */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-[var(--color-border)] p-4 flex justify-between items-center">
            <h2 className="font-bold text-[var(--color-text)] text-lg">Phase 1: Initial Confirmation</h2>
            {initialSubmission ? (
              <span className="flex items-center text-sm font-bold text-[var(--color-success)] bg-[var(--color-success)]/10 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 mr-1.5" /> Submitted
              </span>
            ) : (
              <span className="flex items-center text-sm font-bold text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 mr-1.5" /> Pending
              </span>
            )}
          </div>
          
          <div className="p-6">
            <p className="text-sm text-[var(--color-muted)] mb-6">
              Confirm exactly which sports your college is participating in this year (Yes/No).
            </p>
            
            {initialSubmission ? (
              <div className="space-y-4">
                <p className="text-sm"><strong>Submitted on:</strong> {new Date(initialSubmission.created_at).toLocaleString('en-IN')}</p>
                <Link href="/college/initial-form" className="inline-flex items-center text-sm font-bold text-[var(--color-kslu-maroon)] hover:underline">
                  View your submission <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ) : (
              <div>
                <Link 
                  href="/college/initial-form" 
                  className="inline-flex items-center bg-[var(--color-kslu-maroon)] hover:bg-[var(--color-kslu-maroon-dark)] text-white px-6 py-2.5 rounded font-bold transition-colors"
                >
                  Start Initial Confirmation
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Form Status */}
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-[var(--color-border)] p-4 flex justify-between items-center">
            <h2 className="font-bold text-[var(--color-text)] text-lg">Phase 2: Detailed Proforma</h2>
            <span className="flex items-center text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4 mr-1.5" /> Not Started
            </span>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-[var(--color-muted)] mb-6">
              Submit player details, photos, and generate official PDF eligibility proformas for the sports you selected.
            </p>
            
            {!initialSubmission ? (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded text-sm flex items-start">
                <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                You must complete Phase 1 before you can generate detailed proformas.
              </div>
            ) : (
              <Link 
                href="/college/detailed-form" 
                className="inline-flex items-center bg-[var(--color-kslu-green)] hover:bg-[#164229] text-white px-6 py-2.5 rounded font-bold transition-colors"
              >
                Go to Detailed Proforma
              </Link>
            )}
          </div>
        </div>

      </div>
      
      {/* Notifications / Announcements Box */}
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm p-6">
        <h2 className="font-bold text-[var(--color-kslu-maroon)] text-lg mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          University Announcements
        </h2>
        <div className="text-sm text-[var(--color-muted)] text-center py-8">
          No new announcements from the KSLU Sports Director at this time.
        </div>
      </div>

    </div>
  )
}
