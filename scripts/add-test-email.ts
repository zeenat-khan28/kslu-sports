import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addTestEmail() {
  const testEmail = 'khan4zeenat@gmail.com'

  const { data: colleges, error: fetchError } = await supabase
    .from('colleges')
    .select('*')
    .eq('is_active', true)
    .limit(1)

  if (fetchError || !colleges || colleges.length === 0) {
    console.error('Error fetching college:', fetchError)
    return
  }
  
  const college = colleges[0]

  const { error: dbError } = await supabase
    .from('college_emails')
    .upsert({
      college_id: college.id,
      email: testEmail,
      is_primary: true,
      is_active: true
    }, { onConflict: 'email' })

  if (dbError) {
    console.error('Error inserting test email:', dbError)
  } else {
    console.log(`✅ Test email ${testEmail} added successfully to ${college.name}!`)
  }
}

addTestEmail()
