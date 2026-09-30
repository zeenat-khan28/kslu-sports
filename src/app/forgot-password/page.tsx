'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/set-password`,
      })
    } catch (err) {
      // Silently catch to prevent email enumeration
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="max-w-md w-full bg-[var(--color-surface)] shadow-lg rounded-lg border border-[var(--color-border)] p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-kslu-maroon)]">Reset Password</h1>
          <p className="text-[var(--color-muted)] mt-2">Enter your registered college email</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[var(--color-success)]" />
            </div>
            <div className="p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded">
              <p className="text-sm font-medium text-[var(--color-text)]">
                If this email is registered, a password reset link has been sent.
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-2">
                Please check your inbox and spam folder.
              </p>
            </div>
            <Link 
              href="/login"
              className="block w-full bg-[var(--color-border)] hover:bg-[#c9c2b3] text-[var(--color-text)] py-3 px-4 rounded font-bold transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-[var(--color-kslu-maroon)] hover:bg-[var(--color-kslu-maroon-dark)] text-white py-3 px-4 rounded font-bold transition-colors disabled:opacity-70"
            >
              {loading ? 'Processing...' : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Send Reset Link
                </>
              )}
            </button>
            
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-[var(--color-kslu-maroon)] hover:text-[var(--color-kslu-maroon-dark)] font-medium">
                Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
