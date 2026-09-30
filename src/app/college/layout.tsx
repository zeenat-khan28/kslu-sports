import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutDashboard, FileText, CheckSquare, LogOut } from 'lucide-react'

export default async function CollegeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch college details
  const { data: collegeEmail } = await supabase
    .from('college_emails')
    .select('college_id, colleges(*)')
    .eq('auth_user_id', user.id)
    .single()

  const college = collegeEmail?.colleges as any

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col shadow-sm">
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-kslu-maroon)]">College Portal</h2>
          <p className="text-xs text-[var(--color-muted)] mt-1 font-medium">{college?.name || 'Loading...'}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/college/dashboard" className="flex items-center px-4 py-3 text-sm font-medium text-[var(--color-text)] rounded hover:bg-[var(--color-kslu-saffron)]/10 hover:text-[var(--color-kslu-saffron)] transition-colors no-underline">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/college/initial-form" className="flex items-center px-4 py-3 text-sm font-medium text-[var(--color-text)] rounded hover:bg-[var(--color-kslu-saffron)]/10 hover:text-[var(--color-kslu-saffron)] transition-colors no-underline">
            <CheckSquare className="w-5 h-5 mr-3" />
            Initial Confirmation
          </Link>
          <Link href="/college/detailed-form" className="flex items-center px-4 py-3 text-sm font-medium text-[var(--color-text)] rounded hover:bg-[var(--color-kslu-saffron)]/10 hover:text-[var(--color-kslu-saffron)] transition-colors no-underline">
            <FileText className="w-5 h-5 mr-3" />
            Detailed Proforma
          </Link>
        </nav>
        
        <div className="p-4 border-t border-[var(--color-border)]">
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center px-4 py-2 text-sm font-medium text-[var(--color-danger)] rounded hover:bg-[var(--color-danger)]/10 transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
