import { createClient } from '@/lib/supabase/server'
import InitialFormClient from './InitialFormClient'
import { redirect } from 'next/navigation'
import { AlertTriangle, Clock } from 'lucide-react'

export default async function InitialFormPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: collegeEmail } = await supabase
    .from('college_emails')
    .select('college_id')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!collegeEmail?.college_id) redirect('/college/dashboard')
  const collegeId = collegeEmail.college_id

  // 1. Check window status
  const { data: window } = await supabase
    .from('portal_windows')
    .select('*')
    .eq('phase', 'initial')
    .single()

  const { data: extension } = await supabase
    .from('college_window_extensions')
    .select('*')
    .eq('college_id', collegeId)
    .eq('phase', 'initial')
    .single()

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
  const { data: existingSubmission } = await supabase
    .from('initial_submissions')
    .select('*')
    .eq('college_id', collegeId)
    .single()

  if (existingSubmission && !isOpen) {
     // They submitted, and the window is closed. Just show success message.
     return (
        <div className="max-w-4xl space-y-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Initial Confirmation</h1>
          <div className="p-6 bg-gray-50 border border-[var(--color-border)] rounded-md text-center">
            <h2 className="text-lg font-bold text-[var(--color-success)] mb-2">Form Submitted Successfully</h2>
            <p className="text-[var(--color-muted)] text-sm">
              You submitted your initial confirmation on {new Date(existingSubmission.created_at).toLocaleString('en-IN')}.
              The portal is now closed for editing.
            </p>
          </div>
        </div>
     )
  }

  if (!isOpen && !existingSubmission) {
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
  const { data: sports } = await supabase.from('sports').select('*').eq('is_active', true).order('display_order')
  const { data: sportEvents } = await supabase.from('sport_events').select('*').eq('is_active', true).order('display_order')
  const { data: existingResponses } = await supabase.from('initial_responses').select('*').eq('college_id', collegeId)

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

      {!isOpen && existingSubmission && (
         <div className="p-4 bg-orange-50 border border-orange-200 rounded-md flex items-start text-orange-800 text-sm">
            <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>The portal is technically closed, but you are viewing your locked submission.</span>
         </div>
      )}

      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm">
        <InitialFormClient 
          sports={sportsWithEvents} 
          existingResponses={existingResponses || []} 
          collegeId={collegeId}
          isLocked={!isOpen && !!existingSubmission}
          hasSubmitted={!!existingSubmission}
        />
      </div>
    </div>
  )
}
