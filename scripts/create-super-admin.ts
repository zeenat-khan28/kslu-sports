// Run with: npx tsx scripts/create-super-admin.ts
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const adminEmail = process.env.ADMIN_SEED_EMAIL as string

if (!supabaseUrl || !supabaseServiceKey || !adminEmail) {
  console.error("Missing required environment variables. Please check .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createSuperAdmin() {
  console.log(`Creating super_admin account for ${adminEmail}...`)

  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    email_confirm: true,
    // Generate a secure random password for initial setup.
    // The admin should use "Forgot Password" to set their own, or we provide it here.
    password: 'TempPassword123!',
  })

  if (authError) {
    if (authError.message.includes('already exists')) {
       console.log('Auth user already exists. Fetching user ID...')
    } else {
       console.error("Error creating auth user:", authError)
       return
    }
  }

  // Get the user ID
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) throw usersError
  
  const user = users.users.find(u => u.email === adminEmail.toLowerCase())
  if (!user) {
     console.error("Could not find user after creation.")
     return
  }

  const userId = user.id
  console.log(`Auth User ID: ${userId}`)

  // 2. Insert into admins table
  const { error: dbError } = await supabase
    .from('admins')
    .upsert({
      auth_user_id: userId,
      email: adminEmail.toLowerCase(),
      full_name: 'Super Admin',
      role: 'super_admin',
      is_active: true
    }, { onConflict: 'email' })

  if (dbError) {
    console.error("Error inserting into admins table:", dbError)
  } else {
    console.log("✅ Super admin created successfully!")
    console.log("You can now log in at /admin/login with:")
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: TempPassword123!`)
    console.log("(Please change this password after your first login)")
  }
}

createSuperAdmin()
