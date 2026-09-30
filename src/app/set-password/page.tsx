'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from 'lucide-react'

export default function SetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Requirements: min 10 chars, 1 letter, 1 number
  const hasMinLength = password.length >= 10
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0
  const isValid = hasMinLength && hasLetter && hasNumber && passwordsMatch

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      // Sign in might be necessary or update automatically signs them in.
      // Redirect to dashboard
      router.push('/college/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.')
      setLoading(false)
    }
  }

  // Password strength meter logic (simple)
  let strength = 0
  if (hasMinLength) strength += 33.3
  if (hasLetter) strength += 33.3
  if (hasNumber) strength += 33.4
  
  const strengthColor = 
    strength < 50 ? 'bg-[var(--color-danger)]' : 
    strength < 100 ? 'bg-[var(--color-warning)]' : 
    'bg-[var(--color-success)]'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="max-w-md w-full bg-[var(--color-surface)] shadow-lg rounded-lg border border-[var(--color-border)] p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-kslu-maroon)]">Set Your Password</h1>
          <p className="text-[var(--color-muted)] mt-2">Create a secure password for your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--color-danger)]/10 border-l-4 border-[var(--color-danger)] text-[var(--color-danger)] text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-4 py-3 rounded border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-kslu-saffron)] transition-shadow pr-12"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Strength Meter */}
            {password.length > 0 && (
              <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${strengthColor}`} 
                  style={{ width: `${strength}%` }}
                />
              </div>
            )}
            
            {/* Policy Checklist */}
            <div className="mt-3 space-y-1 text-xs">
              <div className={`flex items-center ${hasMinLength ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]'}`}>
                {hasMinLength ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <XCircle className="w-3 h-3 mr-1.5" />}
                Minimum 10 characters
              </div>
              <div className={`flex items-center ${hasLetter ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]'}`}>
                {hasLetter ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <XCircle className="w-3 h-3 mr-1.5" />}
                Contains at least one letter
              </div>
              <div className={`flex items-center ${hasNumber ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]'}`}>
                {hasNumber ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <XCircle className="w-3 h-3 mr-1.5" />}
                Contains at least one number
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className={`w-full px-4 py-3 rounded border focus:outline-none focus:ring-2 focus:ring-[var(--color-kslu-saffron)] transition-shadow ${
                confirmPassword.length > 0 ? (passwordsMatch ? 'border-[var(--color-success)]' : 'border-[var(--color-danger)]') : 'border-[var(--color-border)]'
              }`}
              placeholder="••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-[var(--color-danger)] mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full flex items-center justify-center bg-[var(--color-kslu-maroon)] hover:bg-[var(--color-kslu-maroon-dark)] text-white py-3 px-4 rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Set Password & Log In
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  )
}
