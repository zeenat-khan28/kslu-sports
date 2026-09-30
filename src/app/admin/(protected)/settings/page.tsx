import { Settings } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">System Settings</h1>
        <p className="text-[var(--color-muted)] mt-1">Configure global portal behavior.</p>
      </div>

      <div className="bg-[var(--color-surface)] p-8 rounded-lg border border-[var(--color-border)] shadow-sm text-center">
        <Settings className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[var(--color-text)]">Coming Soon</h2>
        <p className="text-[var(--color-muted)] mt-2">
          Global settings (like maintenance mode) will be available in the final version.
        </p>
      </div>
    </div>
  )
}
