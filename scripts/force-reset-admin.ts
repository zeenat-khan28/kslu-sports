import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const adminEmail = process.env.ADMIN_SEED_EMAIL as string

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetAdminPassword() {
  console.log(`Resetting password for ${adminEmail}...`)

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) throw usersError
  
  const user = users.users.find(u => u.email === adminEmail.toLowerCase())
  if (!user) {
     console.error("Admin user not found in Auth! You need to run create-super-admin.ts first.")
     return
  }

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: 'TempPassword123!'
  })

  if (error) {
    console.error("Error updating password:", error)
  } else {
    console.log("✅ Admin password successfully reset to: TempPassword123!")
  }
}

resetAdminPassword()
