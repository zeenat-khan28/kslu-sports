import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const DUMMY_EMAIL = 'dummycollege@gmail.com'
const DUMMY_PASSWORD = 'password123'

async function createDummyCollege() {
  console.log('Creating dummy college login...')

  // 1. Get any active college
  const { data: colleges, error: fetchError } = await supabase
    .from('colleges')
    .select('*')
    .eq('is_active', true)
    .limit(1)

  if (fetchError || !colleges || colleges.length === 0) {
    console.error('Error fetching college or no colleges found:', fetchError)
    return
  }
  const college = colleges[0]
  console.log(`Linking to College: ${college.name}`)

  // 2. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: DUMMY_EMAIL,
    email_confirm: true,
    password: DUMMY_PASSWORD,
  })

  let userId: string

  if (authError) {
    if (authError.message.includes('already exists')) {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
      if (usersError) throw usersError
      const user = users.users.find(u => u.email === DUMMY_EMAIL)
      userId = user!.id
    } else {
      console.error('Error creating auth user:', authError)
      return
    }
  } else {
    userId = authData.user.id
  }

  // 3. Insert into college_emails
  const { error: dbError } = await supabase
    .from('college_emails')
    .upsert({
      college_id: college.id,
      email: DUMMY_EMAIL,
      is_primary: true,
      is_active: true,
      auth_user_id: userId,
      activated_at: new Date().toISOString()
    }, { onConflict: 'email' })

  if (dbError) {
    console.error('Error inserting into college_emails:', dbError)
  } else {
    console.log('✅ Dummy college login created successfully!')
    console.log(`Email: ${DUMMY_EMAIL}`)
    console.log(`Password: ${DUMMY_PASSWORD}`)
  }
}

createDummyCollege()
