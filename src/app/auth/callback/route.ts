import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/college/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully exchanged the code. Redirect to the requested page.
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('Code exchange error:', error)
  }

  // If there's an error or no code, redirect to an error page or login
  return NextResponse.redirect(`${origin}/login?error=Invalid+or+expired+activation+link`)
}
