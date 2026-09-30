import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Clock } from 'lucide-react'

export default async function ParticipationTrackerPage() {
  const supabase = await createClient()

  // Fetch all active colleges
  const { data: colleges } = await supabase
    .from('colleges')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  // Fetch all initial submissions
  const { data: initialSubmissions } = await supabase
    .from('initial_submissions')
    .select('college_id, submitted_at')

  const submissionMap = new Map()
  initialSubmissions?.forEach(sub => {
    submissionMap.set(sub.college_id, sub.submitted_at)
  })

  // Fetch detailed forms to calculate completion rate
  const { data: detailedForms } = await supabase
    .from('detailed_forms')
    .select('college_id, status')

  const detailedMap = new Map() // college_id -> { total: X, submitted: Y }
  detailedForms?.forEach(form => {
    const stats = detailedMap.get(form.college_id) || { total: 0, submitted: 0 }
    stats.total += 1
    if (form.status === 'submitted') {
      stats.submitted += 1
    }
    detailedMap.set(form.college_id, stats)
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Participation Tracker</h1>
        <p className="text-[var(--color-muted)] mt-1">Monitor which colleges have submitted their forms in real-time.</p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-[var(--color-border)]">
              <th className="p-4 font-bold text-[var(--color-text)]">College Name</th>
              <th className="p-4 font-bold text-[var(--color-text)] text-center">Initial Confirmation</th>
              <th className="p-4 font-bold text-[var(--color-text)] text-center">Detailed Proforma</th>
            </tr>
          </thead>
          <tbody>
            {colleges?.map(college => {
              const submittedAt = submissionMap.get(college.id)
              const detailedStats = detailedMap.get(college.id)

              return (
                <tr key={college.id} className="border-b border-[var(--color-border)] hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-[var(--color-text)] max-w-xs truncate" title={college.name}>
                    {college.name}
                  </td>
                  <td className="p-4 text-center">
                    {submittedAt ? (
                      <span className="inline-flex items-center text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-1 rounded text-xs font-bold" title={new Date(submittedAt).toLocaleString()}>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[var(--color-warning)] bg-[var(--color-warning)]/10 px-2 py-1 rounded text-xs font-bold">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {!submittedAt ? (
                      <span className="text-gray-400 text-xs">-</span>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                        detailedStats?.submitted === detailedStats?.total && detailedStats?.total > 0
                          ? 'text-[var(--color-success)] bg-[var(--color-success)]/10'
                          : 'text-[var(--color-kslu-green)] bg-[var(--color-kslu-green)]/10'
                      }`}>
                        {detailedStats?.submitted || 0} / {detailedStats?.total || 0} Finalized
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
