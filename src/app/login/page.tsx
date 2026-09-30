'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, LogIn } from 'lucide-react'

export default function CollegeLoginPage() {
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

      // Verify it's a college account (optional extra check, but RLS protects data)
      // Redirect to college dashboard
      router.push('/college/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="max-w-md w-full bg-[var(--color-surface)] shadow-lg rounded-lg border border-[var(--color-border)] p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-kslu-maroon)]">College Login</h1>
          <p className="text-[var(--color-muted)] mt-2">Karnataka State Law University Sports Portal</p>
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
              Registered Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-kslu-saffron)] focus:border-transparent transition-shadow"
              placeholder="e.g. principal@college.edu"
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
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-sm text-[var(--color-kslu-maroon)] hover:text-[var(--color-kslu-maroon-dark)] font-medium">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[var(--color-kslu-maroon)] hover:bg-[var(--color-kslu-maroon-dark)] text-white py-3 px-4 rounded font-bold transition-colors disabled:opacity-70"
          >
            {loading ? 'Logging in...' : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Log In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
          <p className="text-sm text-[var(--color-text)]">
            First time here?{' '}
            <Link href="/activate" className="font-bold text-[var(--color-kslu-maroon)] hover:text-[var(--color-kslu-maroon-dark)]">
              Activate your account
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
