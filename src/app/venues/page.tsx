import { createClient } from '@/lib/supabase/server'
import PublicVenuesList from './PublicVenuesList'

export default async function VenuesPage() {
  const supabase = await createClient()

  const { data: sports } = await supabase
    .from('sports')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  const { data: sportEvents } = await supabase
    .from('sport_events')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  const { data: eventVenues } = await supabase
    .from('event_venues')
    .select('*')

  const sportsWithEvents = sports?.map(sport => ({
    ...sport,
    events: sportEvents
      ?.filter(e => e.sport_id === sport.id)
      .map(event => ({
        ...event,
        venue: eventVenues?.find(v => v.sport_event_id === event.id) || null
      })) || []
  })) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-kslu-maroon)]">Venues & Dates</h1>
        <p className="text-[var(--color-muted)] mt-2 max-w-2xl mx-auto">
          Official schedule for the KSLU Intercollegiate Sports Tournaments 2025-26. 
          Use the filters below to find specific events.
        </p>
      </div>

      <PublicVenuesList initialData={sportsWithEvents} />
      
      <div className="mt-12 text-center border-t border-[var(--color-border)] pt-8">
        <p className="text-sm font-bold text-[var(--color-kslu-maroon)] uppercase tracking-wide">
          Note: Dates and venues are subject to change without prior notice.
        </p>
        <p className="text-xs text-[var(--color-muted)] mt-2">
          Colleges will be notified of any major schedule changes via the portal notification board.
        </p>
      </div>
    </div>
  )
}
