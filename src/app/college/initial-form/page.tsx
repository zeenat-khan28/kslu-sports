import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import InitialFormClient from './InitialFormClient'
import { redirect } from 'next/navigation'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function InitialFormPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Use service role to reliably read data
  const adminDb = createAdminClient()

  const { data: collegeEmail } = await adminDb
    .from('college_emails')
    .select('college_id')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!collegeEmail?.college_id) redirect('/college/dashboard')
  const collegeId = collegeEmail.college_id

  // 1. Check window status
  const { data: window } = await adminDb
    .from('portal_windows')
    .select('*')
    .eq('phase', 'initial')
    .maybeSingle()

  const { data: extension } = await adminDb
    .from('college_window_extensions')
    .select('*')
    .eq('college_id', collegeId)
    .eq('phase', 'initial')
    .maybeSingle()

  const now = new Date()
  let isOpen = false
  let statusMessage = "The initial confirmation window is closed."

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

  // 2. Has the user already submitted?
  const { data: existingSubmission } = await adminDb
    .from('initial_submissions')
    .select('*')
    .eq('college_id', collegeId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // If submitted, show read-only view with success message
  if (existingSubmission) {
    // Fetch sports and existing responses for read-only display
    const { data: sports } = await adminDb.from('sports').select('*').eq('is_active', true).order('display_order')
    const { data: sportEvents } = await adminDb.from('sport_events').select('*').eq('is_active', true).order('display_order')
    const { data: existingResponses } = await adminDb.from('initial_responses').select('*').eq('college_id', collegeId)

    const sportsWithEvents = sports?.map(sport => ({
      ...sport,
      events: sportEvents?.filter(e => e.sport_id === sport.id) || []
    })) || []

    return (
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Initial Confirmation</h1>
          <p className="text-[var(--color-muted)] mt-1">Your submission is locked and cannot be edited.</p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start text-green-800 text-sm">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>
            <strong>Submitted successfully</strong> on {new Date(existingSubmission.submitted_at).toLocaleString('en-IN')}.
            This form is now locked. Contact the administrator if you need changes.
          </span>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm">
          <InitialFormClient 
            sports={sportsWithEvents} 
            existingResponses={existingResponses || []} 
            collegeId={collegeId}
            isLocked={true}
            hasSubmitted={true}
          />
        </div>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Initial Confirmation</h1>
        <div className="p-6 bg-red-50 border border-red-200 rounded-md flex items-start text-red-800">
          <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold">Portal Closed</h2>
            <p className="mt-1 text-sm">{statusMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  // 3. Fetch Sports and existing responses
  const { data: sports } = await adminDb.from('sports').select('*').eq('is_active', true).order('display_order')
  const { data: sportEvents } = await adminDb.from('sport_events').select('*').eq('is_active', true).order('display_order')
  const { data: existingResponses } = await adminDb.from('initial_responses').select('*').eq('college_id', collegeId)

  const sportsWithEvents = sports?.map(sport => ({
    ...sport,
    events: sportEvents?.filter(e => e.sport_id === sport.id) || []
  })) || []

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Initial Confirmation</h1>
        <p className="text-[var(--color-muted)] mt-1">Please confirm Yes or No for your college's participation in each event.</p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm">
        <InitialFormClient 
          sports={sportsWithEvents} 
          existingResponses={existingResponses || []} 
          collegeId={collegeId}
          isLocked={false}
          hasSubmitted={false}
        />
      </div>
    </div>
  )
}
