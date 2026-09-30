'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, Users, Printer, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type DetailedFormClientProps = {
  confirmedEvents: any[]
  existingForms: any[]
  collegeId: string
  isLocked: boolean
}

export default function DetailedFormClient({ confirmedEvents, existingForms, collegeId, isLocked }: DetailedFormClientProps) {
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-0">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-[var(--color-border)]">
              <th className="p-4 font-bold text-[var(--color-text)]">Event Name</th>
              <th className="p-4 font-bold text-[var(--color-text)]">Gender</th>
              <th className="p-4 font-bold text-[var(--color-text)] text-center">Status</th>
              <th className="p-4 font-bold text-[var(--color-text)] text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {confirmedEvents.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--color-muted)]">
                  You have not confirmed participation in any sports.
                </td>
              </tr>
            ) : (
              confirmedEvents.map(eventData => {
                const event = eventData.sport_events
                const form = existingForms.find(f => f.sport_event_id === event.id)
                
                return (
                  <tr key={event.id} className="border-b border-[var(--color-border)] hover:bg-gray-50/50">
                    <td className="p-4 font-semibold text-[var(--color-text)]">
                      {event.sports.name}
                    </td>
                    <td className="p-4 text-[var(--color-text)]">{event.gender}</td>
                    <td className="p-4 text-center">
                      {form?.status === 'submitted' ? (
                        <span className="inline-flex items-center text-[var(--color-success)] bg-[var(--color-success)]/10 px-3 py-1 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Finalized
                        </span>
                      ) : form?.status === 'draft' ? (
                        <span className="inline-flex items-center text-[var(--color-kslu-saffron)] bg-[var(--color-kslu-saffron)]/10 px-3 py-1 rounded-full text-xs font-bold">
                          <FileText className="w-4 h-4 mr-1.5" /> Draft Saved
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-3 py-1 rounded-full text-xs font-bold">
                          <Clock className="w-4 h-4 mr-1.5" /> Not Started
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {form?.status === 'submitted' ? (
                         <Link href={`/college/detailed-form/${event.id}/print`} target="_blank" className="inline-flex items-center text-sm font-bold text-[var(--color-kslu-green)] hover:underline">
                           <Printer className="w-4 h-4 mr-1" /> Print PDF
                         </Link>
                      ) : (
                        <Link 
                          href={`/college/detailed-form/${event.id}`}
                          className="inline-flex items-center text-sm font-bold text-[var(--color-kslu-maroon)] hover:underline"
                        >
                          {isLocked ? 'View Details' : 'Manage Players'}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
