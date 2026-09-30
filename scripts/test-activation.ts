import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

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

async function testActivate() {
  const email = 'khan4zeenat@gmail.com'
  
  console.log(`Testing activation for ${email}...`)

  const { data: collegeEmail, error: fetchError } = await supabaseAdmin
    .from('college_emails')
    .select('id, college_id, auth_user_id')
    .eq('email', email)
    .single()

  if (fetchError || !collegeEmail) {
    console.error('Error fetching college email:', fetchError)
    return
  }
  console.log('Found college email:', collegeEmail)

  let userId = collegeEmail.auth_user_id

  if (!userId) {
    console.log('Creating auth user...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      password: Math.random().toString(36).slice(-10) + 'A1!',
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      if (authError.message.includes('already') || authError.message.includes('registered') || (authError as any).code === 'email_exists') {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers()
        const user = users.users.find(u => u.email === email)
        if (user) userId = user.id
      } else {
        return
      }
    } else {
      userId = authData.user.id
      console.log('Auth user created:', userId)
    }

    if (userId) {
      await supabaseAdmin
        .from('college_emails')
        .update({ auth_user_id: userId })
        .eq('id', collegeEmail.id)
      console.log('Linked auth_user_id to college_emails')
    }
  }

  console.log('Sending reset password email...')
  const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `https://kslu-sports.vercel.app/auth/callback?next=/set-password`,
  })

  if (resetError) {
    console.error('Error sending reset email:', resetError)
  } else {
    console.log('✅ Reset email sent successfully according to Supabase!')
  }
}

testActivate()
