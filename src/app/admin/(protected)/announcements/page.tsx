import { Bell } from 'lucide-react'

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Announcements</h1>
        <p className="text-[var(--color-muted)] mt-1">Broadcast messages to all college dashboards.</p>
      </div>

      <div className="bg-[var(--color-surface)] p-8 rounded-lg border border-[var(--color-border)] shadow-sm text-center">
        <Bell className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[var(--color-text)]">Coming Soon</h2>
        <p className="text-[var(--color-muted)] mt-2">
          The announcements feature will be released in the final milestone.
        </p>
      </div>
    </div>
  )
}
