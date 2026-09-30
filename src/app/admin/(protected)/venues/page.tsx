import { createAdminClient } from '@/lib/supabase/admin'
import VenueManager from './VenueManager'

export const dynamic = 'force-dynamic'

export default async function AdminVenuesPage() {
  const supabase = createAdminClient()

  // Fetch all active sports
  const { data: sports } = await supabase
    .from('sports')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  // Fetch all active sport events
  const { data: sportEvents } = await supabase
    .from('sport_events')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  // Fetch all venues
  const { data: eventVenues } = await supabase
    .from('event_venues')
    .select('*')

  // Group events by sport_id
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Manage Venues & Dates</h1>
        <p className="text-[var(--color-muted)] mt-1">Set the schedule and location for each sport event.</p>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
         <VenueManager initialData={sportsWithEvents} />
      </div>
    </div>
  )
}
