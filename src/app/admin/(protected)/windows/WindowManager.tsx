'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, CheckCircle2, Clock } from 'lucide-react'

type WindowManagerProps = {
  initialData: any[]
}

export default function WindowManager({ initialData }: WindowManagerProps) {
  // Ensure both phases exist in state
  const defaultInitial = initialData.find(w => w.phase === 'initial') || { phase: 'initial', opens_at: '', closes_at: '', manual_override: 'auto' }
  const defaultDetailed = initialData.find(w => w.phase === 'detailed') || { phase: 'detailed', opens_at: '', closes_at: '', manual_override: 'auto' }
  
  const [windows, setWindows] = useState([defaultInitial, defaultDetailed])
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const supabase = createClient()

  const handleChange = (phase: string, field: string, value: string) => {
    setWindows(current => 
      current.map(w => w.phase === phase ? { ...w, [field]: value || null } : w)
    )
  }

  const handleSave = async () => {
    setSavingState('saving')
    try {
      // Format dates for Postgres TIMESTAMPTZ. If input type="datetime-local", it gives YYYY-MM-DDThh:mm
      const formattedWindows = windows.map(w => ({
        ...w,
        opens_at: w.opens_at ? new Date(w.opens_at).toISOString() : null,
        closes_at: w.closes_at ? new Date(w.closes_at).toISOString() : null,
      })).filter(w => w.opens_at && w.closes_at) // Only save if dates are provided

      if (formattedWindows.length > 0) {
        const { error } = await supabase.from('portal_windows').upsert(formattedWindows, { onConflict: 'phase' })
        if (error) throw error
      }
      
      setSavingState('saved')
      setTimeout(() => setSavingState('idle'), 3000)
    } catch (err) {
      console.error(err)
      setSavingState('error')
    }
  }

  // Format datetime for HTML input (YYYY-MM-DDThh:mm)
  const formatForInput = (isoString: string | null) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 16)
  }

  return (
    <div className="space-y-8">
      {windows.map(win => (
        <div key={win.phase} className="p-6 bg-gray-50 border border-[var(--color-border)] rounded-md">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-[var(--color-kslu-maroon)] mr-2" />
            <h2 className="font-bold text-lg text-[var(--color-text)] capitalize">{win.phase} Confirmation Phase</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Opens At</label>
              <input 
                type="datetime-local" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none text-sm bg-white"
                value={formatForInput(win.opens_at)}
                onChange={(e) => handleChange(win.phase, 'opens_at', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Closes At</label>
              <input 
                type="datetime-local" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none text-sm bg-white"
                value={formatForInput(win.closes_at)}
                onChange={(e) => handleChange(win.phase, 'closes_at', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">Manual Override</label>
              <select 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none text-sm bg-white"
                value={win.manual_override || 'auto'}
                onChange={(e) => handleChange(win.phase, 'manual_override', e.target.value)}
              >
                <option value="auto">Auto (Follow Schedule)</option>
                <option value="force_open">Force Open Now</option>
                <option value="force_close">Force Close Now</option>
              </select>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex items-center justify-end pt-4 border-t border-[var(--color-border)]">
        {savingState === 'saved' && (
          <span className="flex items-center text-[var(--color-success)] text-sm font-bold mr-4">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Saved Successfully
          </span>
        )}
        {savingState === 'error' && (
          <span className="text-[var(--color-danger)] text-sm font-bold mr-4">
            Failed to save. Try again.
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={savingState === 'saving'}
          className="flex items-center bg-[var(--color-kslu-maroon)] hover:bg-[var(--color-kslu-maroon-dark)] text-white px-6 py-2 rounded font-bold transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {savingState === 'saving' ? 'Saving...' : 'Save Window Settings'}
        </button>
      </div>
    </div>
  )
}
