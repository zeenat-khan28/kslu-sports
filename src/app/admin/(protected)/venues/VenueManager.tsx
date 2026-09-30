'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, Save, CheckCircle2, AlertTriangle } from 'lucide-react'

type VenueManagerProps = {
  initialData: any[]
}

export default function VenueManager({ initialData }: VenueManagerProps) {
  const [sports, setSports] = useState(initialData)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Track saving state per sport
  const [savingState, setSavingState] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({})

  const supabase = createClient()

  const handleVenueChange = (sportId: string, eventId: string, field: string, value: any) => {
    setSports(currentSports => 
      currentSports.map(sport => {
        if (sport.id !== sportId) return sport
        
        return {
          ...sport,
          events: sport.events.map((ev: any) => {
            if (ev.id !== eventId) return ev
            
            // Ensure venue object exists
            const currentVenue = ev.venue || { sport_event_id: eventId, status: 'tba' }
            return {
              ...ev,
              venue: { ...currentVenue, [field]: value }
            }
          })
        }
      })
    )
  }

  const handleSaveSport = async (sport: any) => {
    setSavingState(prev => ({ ...prev, [sport.id]: 'saving' }))
    
    try {
      const venuesToUpsert = sport.events
        .filter((ev: any) => ev.venue)
        .map((ev: any) => ({
          sport_event_id: ev.id,
          venue_text: ev.venue.venue_text || null,
          location: ev.venue.location || null,
          start_date: ev.venue.start_date || null,
          end_date: ev.venue.end_date || null,
          status: ev.venue.status || 'tba',
          contact_name: ev.venue.contact_name || null,
          contact_phone: ev.venue.contact_phone || null,
          remarks: ev.venue.remarks || null,
        }))

      if (venuesToUpsert.length === 0) {
        setSavingState(prev => ({ ...prev, [sport.id]: 'saved' }))
        setTimeout(() => setSavingState(prev => ({ ...prev, [sport.id]: 'idle' })), 3000)
        return
      }

      const { error } = await supabase
        .from('event_venues')
        .upsert(venuesToUpsert, { onConflict: 'sport_event_id' })

      if (error) throw error

      setSavingState(prev => ({ ...prev, [sport.id]: 'saved' }))
      setTimeout(() => setSavingState(prev => ({ ...prev, [sport.id]: 'idle' })), 3000)
      
    } catch (error) {
      console.error("Error saving venues:", error)
      setSavingState(prev => ({ ...prev, [sport.id]: 'error' }))
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-4">
      {/* Expand/Collapse All */}
      <div className="flex justify-end space-x-4 mb-6">
        <button 
          onClick={() => setExpandedId('all')} 
          className="text-sm font-bold text-[var(--color-kslu-maroon)] hover:underline"
        >
          Expand All
        </button>
        <button 
          onClick={() => setExpandedId(null)} 
          className="text-sm font-bold text-[var(--color-kslu-maroon)] hover:underline"
        >
          Collapse All
        </button>
      </div>

      {sports.map(sport => {
        const isExpanded = expandedId === 'all' || expandedId === sport.id
        const saveStatus = savingState[sport.id] || 'idle'
        
        return (
          <div key={sport.id} className="border border-[var(--color-border)] rounded-md overflow-hidden">
            
            {/* Accordion Header */}
            <button
              onClick={() => toggleExpand(sport.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="font-bold text-lg text-[var(--color-text)]">{sport.name}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                  {sport.events.length} events
                </span>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>

            {/* Accordion Body */}
            {isExpanded && (
              <div className="p-6 bg-white border-t border-[var(--color-border)] space-y-8">
                {sport.events.map((event: any) => {
                  const venue = event.venue || {}
                  
                  // Validation warning
                  const endDateBeforeStart = venue.start_date && venue.end_date && new Date(venue.end_date) < new Date(venue.start_date)

                  return (
                    <div key={event.id} className="space-y-4">
                      <h4 className="font-bold text-[var(--color-kslu-maroon)] text-md border-b pb-2">
                        {event.display_name || event.gender}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="col-span-1 md:col-span-2 lg:col-span-1">
                          <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1">Status</label>
                          <select 
                            className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none"
                            value={venue.status || 'tba'}
                            onChange={(e) => handleVenueChange(sport.id, event.id, 'status', e.target.value)}
                          >
                            <option value="tba">To be announced</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="postponed">Postponed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        
                        <div className="col-span-1 md:col-span-2 lg:col-span-2">
                          <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1">Venue / Host College</label>
                          <input 
                            type="text" 
                            className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none"
                            placeholder="e.g. KSLU Campus"
                            value={venue.venue_text || ''}
                            onChange={(e) => handleVenueChange(sport.id, event.id, 'venue_text', e.target.value)}
                          />
                        </div>

                        <div className="col-span-1 md:col-span-2 lg:col-span-1">
                          <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1">City / Location</label>
                          <input 
                            type="text" 
                            className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none"
                            placeholder="e.g. Hubballi"
                            value={venue.location || ''}
                            onChange={(e) => handleVenueChange(sport.id, event.id, 'location', e.target.value)}
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1">Start Date</label>
                          <input 
                            type="date" 
                            className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none"
                            value={venue.start_date || ''}
                            onChange={(e) => handleVenueChange(sport.id, event.id, 'start_date', e.target.value)}
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1">End Date</label>
                          <input 
                            type="date" 
                            className={`w-full text-sm p-2 border rounded focus:ring-2 outline-none ${endDateBeforeStart ? 'border-red-500 focus:ring-red-500' : 'focus:ring-[var(--color-kslu-saffron)]'}`}
                            value={venue.end_date || ''}
                            onChange={(e) => handleVenueChange(sport.id, event.id, 'end_date', e.target.value)}
                          />
                          {endDateBeforeStart && (
                            <p className="text-[10px] text-red-600 mt-1 flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" /> End date is before start date
                            </p>
                          )}
                        </div>
                        
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1">Contact Name (Opt)</label>
                          <input 
                            type="text" 
                            className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none"
                            value={venue.contact_name || ''}
                            onChange={(e) => handleVenueChange(sport.id, event.id, 'contact_name', e.target.value)}
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1">Contact Phone (Opt)</label>
                          <input 
                            type="text" 
                            className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none"
                            value={venue.contact_phone || ''}
                            onChange={(e) => handleVenueChange(sport.id, event.id, 'contact_phone', e.target.value)}
                          />
                        </div>
                        
                        <div className="col-span-1 md:col-span-2 lg:col-span-4">
                          <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1">Remarks (Optional)</label>
                          <input 
                            type="text" 
                            className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none"
                            placeholder="Any special notes for colleges..."
                            value={venue.remarks || ''}
                            onChange={(e) => handleVenueChange(sport.id, event.id, 'remarks', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                <div className="pt-4 border-t flex items-center justify-end">
                  {saveStatus === 'saved' && (
                    <span className="flex items-center text-[var(--color-success)] text-sm font-bold mr-4">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Saved Successfully
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-[var(--color-danger)] text-sm font-bold mr-4">
                      Failed to save. Try again.
                    </span>
                  )}
                  
                  <button
                    onClick={() => handleSaveSport(sport)}
                    disabled={saveStatus === 'saving'}
                    className="flex items-center bg-[var(--color-kslu-green)] hover:bg-[#164229] text-white px-6 py-2 rounded font-bold transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveStatus === 'saving' ? 'Saving...' : `Save ${sport.name} Venues`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
