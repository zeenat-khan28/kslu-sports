import { createClient } from '@/lib/supabase/server'
import { Activity } from 'lucide-react'

export default async function AdminSportsPage() {
  const supabase = await createClient()

  const { data: sports } = await supabase
    .from('sports')
    .select('*, sport_events(*)')
    .order('display_order')

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Sports Setup</h1>
        <p className="text-[var(--color-muted)] mt-1">View the configured sports and events for this academic year.</p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] bg-gray-50 flex items-center justify-between">
           <h2 className="font-bold flex items-center text-[var(--color-kslu-maroon)]">
              <Activity className="w-5 h-5 mr-2" />
              Active Sports ({sports?.length || 0})
           </h2>
        </div>
        
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-[var(--color-border)]">
              <th className="p-4 font-bold text-[var(--color-text)]">Sport Name</th>
              <th className="p-4 font-bold text-[var(--color-text)]">Type</th>
              <th className="p-4 font-bold text-[var(--color-text)]">Events configured</th>
            </tr>
          </thead>
          <tbody>
            {sports?.map(sport => (
              <tr key={sport.id} className="border-b border-[var(--color-border)] hover:bg-gray-50/50">
                <td className="p-4 font-medium text-[var(--color-text)]">{sport.name}</td>
                <td className="p-4 text-[var(--color-muted)]">{sport.is_team_sport ? 'Team Sport' : 'Individual'}</td>
                <td className="p-4 text-[var(--color-muted)]">
                   {sport.sport_events?.map((e: any) => e.gender).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
