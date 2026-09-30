import { createAdminClient } from '@/lib/supabase/admin'
import { Building2, FileCheck, Users, AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()
  
  // 1. Fetch high-level stats
  const { count: totalColleges } = await supabase
    .from('colleges')
    .select('*', { count: 'exact', head: true })
    
  // Since this is a quick dashboard, we do simple counts.
  const { count: initialResponses } = await supabase
    .from('initial_submissions')
    .select('*', { count: 'exact', head: true })

  const { count: detailedForms } = await supabase
    .from('detailed_forms')
    .select('*', { count: 'exact', head: true })

  // 2. Fetch window status
  const { data: windows } = await supabase
    .from('portal_windows')
    .select('*')
    
  const initialWindow = windows?.find(w => w.phase === 'initial')
  const detailedWindow = windows?.find(w => w.phase === 'detailed')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Admin Dashboard</h1>
        <p className="text-[var(--color-muted)] mt-1">Overview of the KSLU Intercollegiate Sports Portal 2025-26</p>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm border-l-4 border-l-[var(--color-kslu-maroon)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted)]">Total Colleges</p>
              <p className="text-3xl font-bold text-[var(--color-text)] mt-2">{totalColleges || 0}</p>
            </div>
            <div className="w-12 h-12 bg-[var(--color-kslu-maroon)]/10 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[var(--color-kslu-maroon)]" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm border-l-4 border-l-[var(--color-kslu-green)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted)]">Initial Conf. Received</p>
              <p className="text-3xl font-bold text-[var(--color-text)] mt-2">{initialResponses || 0}</p>
            </div>
            <div className="w-12 h-12 bg-[var(--color-kslu-green)]/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[var(--color-kslu-green)]" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm border-l-4 border-l-[var(--color-kslu-saffron)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted)]">Detailed Forms Submitted</p>
              <p className="text-3xl font-bold text-[var(--color-text)] mt-2">{detailedForms || 0}</p>
            </div>
            <div className="w-12 h-12 bg-[var(--color-kslu-saffron)]/10 rounded-full flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-[var(--color-kslu-saffron)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Portal Windows Status */}
      <h2 className="text-xl font-bold text-[var(--color-text)] mt-12 mb-4">Portal Windows Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-kslu-maroon)]">Initial Confirmation Phase</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Opens At:</span>
              <span className="font-medium">{initialWindow?.opens_at ? new Date(initialWindow.opens_at).toLocaleString('en-IN') : 'Not Set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Closes At:</span>
              <span className="font-medium">{initialWindow?.closes_at ? new Date(initialWindow.closes_at).toLocaleString('en-IN') : 'Not Set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Manual Override:</span>
              <span className="font-medium capitalize">{initialWindow?.manual_override || 'Auto'}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-right">
              <Link href="/admin/windows" className="text-[var(--color-kslu-maroon)] hover:text-[var(--color-kslu-maroon-dark)] font-bold text-sm">Manage Schedule &rarr;</Link>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-kslu-maroon)]">Detailed Confirmation Phase</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Opens At:</span>
              <span className="font-medium">{detailedWindow?.opens_at ? new Date(detailedWindow.opens_at).toLocaleString('en-IN') : 'Not Set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Closes At:</span>
              <span className="font-medium">{detailedWindow?.closes_at ? new Date(detailedWindow.closes_at).toLocaleString('en-IN') : 'Not Set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Manual Override:</span>
              <span className="font-medium capitalize">{detailedWindow?.manual_override || 'Auto'}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-right">
              <Link href="/admin/windows" className="text-[var(--color-kslu-maroon)] hover:text-[var(--color-kslu-maroon-dark)] font-bold text-sm">Manage Schedule &rarr;</Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
