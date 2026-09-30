import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function syncAdmin() {
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) {
    console.error("Error fetching users:", usersError)
    return
  }
  
  const adminAuthUser = users.users.find(u => u.email === 'kslu.physicaldirector@gmail.com')
  
  if (!adminAuthUser) {
    console.error("Admin auth user not found in auth.users!")
    return
  }
  
  console.log("Found admin in auth.users with UID:", adminAuthUser.id)
  
  const { error: updateError } = await supabase
    .from('admins')
    .update({ auth_user_id: adminAuthUser.id })
    .eq('email', 'kslu.physicaldirector@gmail.com')
    
  if (updateError) {
    console.error("Failed to update admins table:", updateError)
  } else {
    console.log("Successfully synced admins table with auth_user_id:", adminAuthUser.id)
  }
}

syncAdmin()
