'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, Calendar, MapPin, Phone, Printer } from 'lucide-react'

type PublicVenuesListProps = {
  initialData: any[]
}

export default function PublicVenuesList({ initialData }: PublicVenuesListProps) {
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState<'All' | 'Men' | 'Women'>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filter logic
  const filteredData = initialData.map(sport => {
    // Filter events by gender
    const filteredEvents = sport.events.filter((ev: any) => {
      if (genderFilter !== 'All' && ev.gender !== genderFilter) return false
      return true
    })

    return {
      ...sport,
      events: filteredEvents
    }
  }).filter(sport => {
    // Hide sports that have 0 events after gender filter
    if (sport.events.length === 0) return false
    
    // Text search
    if (search) {
      const q = search.toLowerCase()
      if (sport.name.toLowerCase().includes(q)) return true
      
      // Search inside venues
      const matchVenue = sport.events.some((ev: any) => {
        const v = ev.venue
        if (!v) return false
        return (
          v.venue_text?.toLowerCase().includes(q) ||
          v.location?.toLowerCase().includes(q)
        )
      })
      if (matchVenue) return true
      return false
    }
    
    return true
  })

  const handlePrint = () => {
    // In a real app, you might generate a PDF here or just trigger window.print
    window.print()
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <span className="bg-[var(--color-success)] text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Confirmed</span>
      case 'postponed': return <span className="bg-[var(--color-warning)] text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Postponed</span>
      case 'cancelled': return <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Cancelled</span>
      default: return <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded uppercase">TBA</span>
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between no-print">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sport, venue, or city..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <select 
            className="p-2 border rounded-md focus:ring-2 focus:ring-[var(--color-kslu-saffron)] outline-none bg-white"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
          >
            <option value="All">All Categories</option>
            <option value="Men">Men Only</option>
            <option value="Women">Women Only</option>
          </select>
          
          <button 
            onClick={handlePrint}
            className="flex items-center text-sm font-bold text-[var(--color-text)] bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print List
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-4 no-print">
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

      {/* List */}
      <div className="space-y-4 print-friendly">
        {filteredData.length === 0 && (
          <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
            <p className="text-[var(--color-muted)] font-medium">No venues found matching your search.</p>
          </div>
        )}

        {filteredData.map(sport => {
          const isExpanded = expandedId === 'all' || expandedId === sport.id
          
          return (
            <div key={sport.id} className="border border-[var(--color-border)] rounded-md overflow-hidden bg-[var(--color-surface)] break-inside-avoid">
              
              <button
                onClick={() => toggleExpand(sport.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors no-print"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-lg text-[var(--color-text)]">{sport.name}</span>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>

              {/* Print-only title */}
              <div className="hidden print-title p-2 bg-gray-100 font-bold text-lg border-b">
                {sport.name}
              </div>

              {(isExpanded || typeof window === 'undefined' /* render for print */) && (
                <div className="p-0 sm:p-4">
                  <div className="divide-y divide-[var(--color-border)]">
                    {sport.events.map((event: any) => {
                      const venue = event.venue || {}
                      const isTba = !venue.status || venue.status === 'tba'
                      
                      return (
                        <div key={event.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          
                          <div className="md:w-1/4">
                            <h4 className="font-bold text-[var(--color-kslu-maroon)] text-lg mb-1">
                              {event.display_name || event.gender}
                            </h4>
                            <div className="mt-1">{getStatusBadge(venue.status)}</div>
                          </div>
                          
                          <div className="md:w-1/2 space-y-2">
                            <div className="flex items-start">
                              <MapPin className="w-5 h-5 text-[var(--color-kslu-green)] mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-[var(--color-text)]">{isTba ? 'To be announced' : (venue.venue_text || 'Venue TBD')}</p>
                                <p className="text-sm text-[var(--color-muted)]">{venue.location || ''}</p>
                              </div>
                            </div>
                            
                            {(venue.contact_name || venue.contact_phone) && (
                              <div className="flex items-center text-sm text-[var(--color-muted)]">
                                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                {venue.contact_name} {venue.contact_phone ? `(${venue.contact_phone})` : ''}
                              </div>
                            )}
                            
                            {venue.remarks && (
                              <p className="text-xs text-[var(--color-kslu-saffron)] font-medium mt-1">Note: {venue.remarks}</p>
                            )}
                          </div>
                          
                          <div className="md:w-1/4 bg-gray-50 p-3 rounded text-center md:text-right border border-gray-100">
                            <div className="flex items-center justify-center md:justify-end mb-1 text-[var(--color-kslu-maroon)]">
                              <Calendar className="w-4 h-4 mr-1.5" />
                              <span className="font-bold text-sm">Dates</span>
                            </div>
                            {isTba || (!venue.start_date && !venue.end_date) ? (
                              <p className="text-sm text-[var(--color-muted)]">TBA</p>
                            ) : (
                              <div className="text-sm font-semibold">
                                {venue.start_date ? new Date(venue.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                                {venue.end_date && venue.end_date !== venue.start_date ? ` to ${new Date(venue.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                              </div>
                            )}
                            {venue.updated_at && (
                              <p className="text-[9px] text-gray-400 mt-2">
                                Updated: {new Date(venue.updated_at).toLocaleDateString('en-IN')}
                              </p>
                            )}
                          </div>
                          
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* CSS for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          .print-title { display: block !important; }
          body { background: white; }
          .print-friendly { display: block !important; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}} />
    </div>
  )
}
