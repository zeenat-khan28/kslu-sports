import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { 
  LayoutDashboard, 
  MapPin, 
  Clock, 
  Users, 
  Building2, 
  Activity,
  Bell,
  Settings,
  LogOut
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // We should also check if the user is in the admins table for extra security,
  // but middleware handles the basic route protection.

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col shadow-sm">
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-kslu-maroon)]">Admin Portal</h2>
          <p className="text-xs text-[var(--color-muted)] truncate mt-1">{user.email}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin/dashboard" className="flex items-center px-4 py-3 text-sm font-medium text-[var(--color-text)] rounded hover:bg-[var(--color-kslu-saffron)]/10 hover:text-[var(--color-kslu-saffron)] transition-colors no-underline">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/admin/venues" className="flex items-center px-4 py-3 text-sm font-medium text-[var(--color-text)] rounded hover:bg-[var(--color-kslu-saffron)]/10 hover:text-[var(--color-kslu-saffron)] transition-colors no-underline">
            <MapPin className="w-5 h-5 mr-3" />
            Manage Venues
          </Link>
          <Link href="/admin/windows" className="flex items-center px-4 py-3 text-sm font-medium text-[var(--color-text)] rounded hover:bg-[var(--color-kslu-saffron)]/10 hover:text-[var(--color-kslu-saffron)] transition-colors no-underline">
            <Clock className="w-5 h-5 mr-3" />
            Portal Windows
          </Link>
          <Link href="/admin/participation" className="flex items-center px-4 py-3 text-sm font-medium text-[var(--color-text)] rounded hover:bg-[var(--color-kslu-saffron)]/10 hover:text-[var(--color-kslu-saffron)] transition-colors no-underline">
            <Users className="w-5 h-5 mr-3" />
            Participation Tracker
          </Link>
          <Link href="/admin/colleges" className="flex items-center px-4 py-3 text-sm font-medium text-[var(--color-text)] rounded hover:bg-[var(--color-kslu-saffron)]/10 hover:text-[var(--color-kslu-saffron)] transition-colors no-underline">
            <Building2 className="w-5 h-5 mr-3" />
            Colleges Data
          </Link>
          <Link href="/admin/sports" className="flex items-center px-4 py-3 text-sm font-medium text-[var(--color-text)] rounded hover:bg-[var(--color-kslu-saffron)]/10 hover:text-[var(--color-kslu-saffron)] transition-colors no-underline">
            <Activity className="w-5 h-5 mr-3" />
            Sports Setup
          </Link>
          <Link href="/admin/announcements" className="flex items-center px-4 py-3 text-sm font-medium text-[var(--color-text)] rounded hover:bg-[var(--color-kslu-saffron)]/10 hover:text-[var(--color-kslu-saffron)] transition-colors no-underline">
            <Bell className="w-5 h-5 mr-3" />
            Announcements
          </Link>
        </nav>
        
        <div className="p-4 border-t border-[var(--color-border)] space-y-1">
          <Link href="/admin/settings" className="flex items-center px-4 py-2 text-sm font-medium text-[var(--color-text)] rounded hover:bg-gray-100 transition-colors no-underline">
            <Settings className="w-5 h-5 mr-3 text-[var(--color-muted)]" />
            Settings
          </Link>
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
