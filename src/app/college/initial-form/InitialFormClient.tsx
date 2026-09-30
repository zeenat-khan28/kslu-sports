'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, CheckCircle2, AlertCircle } from 'lucide-react'

type InitialFormClientProps = {
  sports: any[]
  existingResponses: any[]
  collegeId: string
  isLocked: boolean
  hasSubmitted: boolean
}

export default function InitialFormClient({ sports, existingResponses, collegeId, isLocked, hasSubmitted }: InitialFormClientProps) {
  const supabase = createClient()
  
  // Format state as Map of event_id -> is_participating (boolean)
  const initialMap = new Map<string, boolean>()
  existingResponses.forEach(r => {
    initialMap.set(r.sport_event_id, r.participating)
  })

  const [responses, setResponses] = useState(initialMap)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleToggle = (eventId: string, value: boolean) => {
    if (isLocked) return
    const newResponses = new Map(responses)
    newResponses.set(eventId, value)
    setResponses(newResponses)
  }

  const handleSave = async (isFinalSubmit: boolean = false) => {
    setSaving(true)
    setSaveStatus('idle')
    
    try {
      // 1. Prepare UPSERT payload
      const payload = Array.from(responses.entries()).map(([eventId, isParticipating]) => ({
        college_id: collegeId,
        sport_event_id: eventId,
        participating: isParticipating
      }))

      if (payload.length > 0) {
        const { error: upsertError } = await supabase
          .from('initial_responses')
          .upsert(payload, { onConflict: 'college_id,sport_event_id' })
        
        if (upsertError) throw upsertError
      }

      // 2. Mark as submitted if requested
      if (isFinalSubmit) {
        const { error: submitError } = await supabase
          .from('initial_submissions')
          .upsert({ college_id: collegeId }, { onConflict: 'college_id' })
          
        if (submitError) throw submitError
        
        // Need to reload to get the server-side lock state updated
        window.location.reload()
      } else {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }

    } catch (err: any) {
      console.error(err)
      setSaveStatus('error')
      setErrorMessage(err.message || 'An error occurred while saving.')
    } finally {
      setSaving(false)
    }
  }

  // Count un-answered questions
  let unanswered = 0
  sports.forEach(s => {
    s.events.forEach((e: any) => {
      if (!responses.has(e.id)) unanswered++
    })
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-0">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-[var(--color-border)]">
              <th className="p-4 font-bold text-[var(--color-text)]">Sport</th>
              <th className="p-4 font-bold text-[var(--color-text)]">Gender</th>
              <th className="p-4 font-bold text-[var(--color-text)] text-center w-48">Participating?</th>
            </tr>
          </thead>
          <tbody>
            {sports.map(sport => (
              sport.events.map((event: any, index: number) => (
                <tr key={event.id} className="border-b border-[var(--color-border)] hover:bg-gray-50/50">
                  {index === 0 && (
                    <td className="p-4 font-semibold text-[var(--color-text)]" rowSpan={sport.events.length}>
                      {sport.name}
                    </td>
                  )}
                  <td className="p-4 text-[var(--color-text)]">{event.gender}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-4">
                      <label className={`flex items-center cursor-pointer ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <input 
                          type="radio" 
                          name={`event-${event.id}`}
                          className="mr-2 h-4 w-4 text-[var(--color-kslu-green)] focus:ring-[var(--color-kslu-green)]"
                          checked={responses.get(event.id) === true}
                          onChange={() => handleToggle(event.id, true)}
                          disabled={isLocked}
                        />
                        Yes
                      </label>
                      <label className={`flex items-center cursor-pointer ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <input 
                          type="radio" 
                          name={`event-${event.id}`}
                          className="mr-2 h-4 w-4 text-[var(--color-danger)] focus:ring-[var(--color-danger)]"
                          checked={responses.get(event.id) === false}
                          onChange={() => handleToggle(event.id, false)}
                          disabled={isLocked}
                        />
                        No
                      </label>
                    </div>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      {!isLocked && (
        <div className="p-6 border-t border-[var(--color-border)] bg-gray-50 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            {unanswered > 0 ? (
              <span className="text-sm text-[var(--color-warning)] font-bold flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                {unanswered} events left unanswered
              </span>
            ) : (
              <span className="text-sm text-[var(--color-success)] font-bold flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                All events answered!
              </span>
            )}
            
            {saveStatus === 'error' && (
              <p className="text-sm text-[var(--color-danger)] mt-1">{errorMessage}</p>
            )}
            {saveStatus === 'success' && (
              <p className="text-sm text-[var(--color-success)] mt-1">Draft saved successfully.</p>
            )}
          </div>
          
          <div className="flex space-x-3 w-full md:w-auto">
            <button 
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1 md:flex-none px-4 py-2 bg-white border border-[var(--color-border)] text-[var(--color-text)] rounded font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {saving && saveStatus !== 'error' ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={saving || unanswered > 0}
              className="flex-1 md:flex-none flex items-center justify-center px-6 py-2 bg-[var(--color-kslu-maroon)] text-white rounded font-bold hover:bg-[var(--color-kslu-maroon-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              Final Submit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
