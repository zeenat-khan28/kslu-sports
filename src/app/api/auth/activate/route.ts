import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// We need the service role key to create users and bypass RLS to check emails
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Check if the email exists in our college_emails table
    const { data: collegeEmail, error: fetchError } = await supabaseAdmin
      .from('college_emails')
      .select('id, college_id, auth_user_id')
      .eq('email', normalizedEmail)
      .single()

    if (fetchError || !collegeEmail) {
      // Return 200 anyway to prevent email enumeration
      return NextResponse.json({ success: true })
    }

    // 2. If the user doesn't exist in Supabase Auth yet, create them
    let userId = collegeEmail.auth_user_id

    if (!userId) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true, // Auto confirm so they can log in immediately after setting password
        password: Math.random().toString(36).slice(-10) + 'A1!', // Random secure temp password
      })

      if (authError) {
        if (authError.message.includes('already') || authError.message.includes('registered') || (authError as any).code === 'email_exists') {
          const { data: users } = await supabaseAdmin.auth.admin.listUsers()
          const user = users.users.find(u => u.email === normalizedEmail)
          if (user) userId = user.id
        } else {
          console.error('Error creating auth user:', authError)
          return NextResponse.json({ success: true }) // Fail silently for security
        }
      } else {
        userId = authData.user.id
      }

      // Update college_emails with the new auth_user_id
      if (userId) {
        await supabaseAdmin
          .from('college_emails')
          .update({ auth_user_id: userId })
          .eq('id', collegeEmail.id)
      }
    }

    // 3. Send the password reset / activation email using standard Supabase Auth
    // Because they now exist in auth.users, this will actually send an email!
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/set-password`,
    })

    if (resetError) {
      console.error('Error sending reset email:', resetError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json({ success: true }) // Always return success
  }
}
