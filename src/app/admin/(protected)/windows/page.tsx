import { createClient } from '@/lib/supabase/server'
import WindowManager from './WindowManager'

export default async function AdminWindowsPage() {
  const supabase = await createClient()

  const { data: windows } = await supabase
    .from('portal_windows')
    .select('*')
    .order('phase')

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Portal Windows Management</h1>
        <p className="text-[var(--color-muted)] mt-1">Control exactly when colleges can submit their forms.</p>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm">
         <WindowManager initialData={windows || []} />
      </div>
    </div>
  )
}
