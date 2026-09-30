import { createClient } from '@/lib/supabase/server'
import { Building2 } from 'lucide-react'

export default async function AdminCollegesPage() {
  const supabase = await createClient()

  // Fetch all colleges and their primary email
  const { data: colleges } = await supabase
    .from('colleges')
    .select(`
      id, 
      name, 
      zone, 
      code,
      college_emails (
        email
      )
    `)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Colleges Directory</h1>
        <p className="text-[var(--color-muted)] mt-1">Manage and view the list of 136 affiliated law colleges.</p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] bg-gray-50 flex items-center justify-between">
           <h2 className="font-bold flex items-center text-[var(--color-kslu-maroon)]">
              <Building2 className="w-5 h-5 mr-2" />
              {colleges?.length || 0} Registered Colleges
           </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-[var(--color-border)]">
                <th className="p-4 font-bold text-[var(--color-text)] w-16">Code</th>
                <th className="p-4 font-bold text-[var(--color-text)]">College Name</th>
                <th className="p-4 font-bold text-[var(--color-text)]">Zone</th>
                <th className="p-4 font-bold text-[var(--color-text)]">Primary Email</th>
              </tr>
            </thead>
            <tbody>
              {colleges?.map(college => (
                <tr key={college.id} className="border-b border-[var(--color-border)] hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-[var(--color-muted)]">{college.code || '-'}</td>
                  <td className="p-4 font-medium text-[var(--color-text)] max-w-md truncate" title={college.name}>{college.name}</td>
                  <td className="p-4 text-[var(--color-muted)]">{college.zone || 'Unassigned'}</td>
                  <td className="p-4 text-[var(--color-muted)]">
                    {college.college_emails?.[0]?.email || <span className="text-[var(--color-warning)] italic">No email</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
