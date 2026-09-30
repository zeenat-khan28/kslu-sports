'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Redirect to admin dashboard
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="max-w-md w-full bg-[var(--color-surface)] shadow-lg rounded-lg border-t-4 border-[var(--color-kslu-green)] p-8">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[var(--color-kslu-green)]/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-[var(--color-kslu-green)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Admin Portal</h1>
          <p className="text-[var(--color-muted)] mt-2">KSLU Sports Section Authorized Staff Only</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--color-danger)]/10 border-l-4 border-[var(--color-danger)] flex items-start text-[var(--color-danger)]">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Staff Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-kslu-saffron)] focus:border-transparent transition-shadow"
              placeholder="admin@kslu.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-kslu-saffron)] focus:border-transparent transition-shadow"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[var(--color-kslu-green)] hover:bg-[#164229] text-white py-3 px-4 rounded font-bold transition-colors disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

      </div>
    </div>
  )
}
