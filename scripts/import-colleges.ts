// Run with: npx tsx scripts/import-colleges.ts
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables. Please check .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function cleanString(str: string) {
  if (!str) return ''
  return str
    .replace(/<br\s*\/?>/gi, ' ') // Replace HTML breaks with space
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
}

function extractPhones(nameStr: string): { name: string, phones: string[] } {
  // Row 121 rule: extract phones from name like "College Name 9916537177/9448062295"
  const phoneRegex = /(?:\b\d{10}\b[\/\s,]*)+/g
  const match = nameStr.match(phoneRegex)
  
  if (match) {
    const rawPhones = match[0]
    const phones = rawPhones.split(/[\/\s,]+/).filter(p => p.length === 10)
    const cleanedName = nameStr.replace(rawPhones, '').replace(/[^a-zA-Z\s]/g, '').trim()
    return { name: cleanedName, phones }
  }
  return { name: nameStr, phones: [] }
}

function parseEmails(emailStr: string): string[] {
  if (!emailStr) return []
  return emailStr
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/[,;]/g, ' ')
    .split(/\s+/)
    .map(e => e.replace(/\.$/, '').toLowerCase().trim()) // Remove trailing dots
    .filter(e => e.includes('@')) // Basic validation
}

function isSuspiciousEmail(email: string) {
  const badDomains = ['gamil.com', 'gmial.com', 'gmai.com', '.con', 'yaho.com']
  return badDomains.some(bad => email.includes(bad))
}

async function runImport() {
  const mdPath = path.join(process.cwd(), 'law_colleges_136.md')
  if (!fs.existsSync(mdPath)) {
    console.error("Error: law_colleges_136.md not found in the root directory!")
    console.error("Please paste your college data into this file and try again.")
    process.exit(1)
  }

  console.log("Reading law_colleges_136.md...")
  const content = fs.readFileSync(mdPath, 'utf8')
  
  // Extract markdown table rows
  const lines = content.split('\n').filter(line => line.trim().startsWith('|'))
  
  // Skip header and separator rows
  const dataLines = lines.slice(2)
  
  let tmpCounter = 1
  let importedCount = 0
  let skippedCount = 0
  let flaggedCount = 0
  
  // Generate a batch ID for issues
  const batchId = crypto.randomUUID()

  console.log(`Found ${dataLines.length} potential rows to import.`)

  for (const line of dataLines) {
    const cols = line.split('|').map(c => c.trim())
    // cols[0] is empty because of leading pipe
    const rawCode = cleanString(cols[2])
    const rawName = cleanString(cols[3])
    const rawEmail = cleanString(cols[4])

    let code = rawCode
    let tempCode = null
    let name = rawName
    let status = 'active'
    let phones: string[] = []
    let emails = parseEmails(rawEmail)

    // Rule: Row 58 (no name, no email)
    if (!name && emails.length === 0) {
      status = 'incomplete'
      name = "UNKNOWN COLLEGE (To be updated)"
      flaggedCount++
    }

    // Rule: Rows 133-136 (no code)
    if (!code || code === '-') {
      tempCode = `TMP-${String(tmpCounter).padStart(3, '0')}`
      code = tempCode
      tmpCounter++
      flaggedCount++
    }

    // Rule: Row 121 (phones glued to name)
    const phoneExtraction = extractPhones(name)
    name = phoneExtraction.name
    phones = phoneExtraction.phones

    // Insert College
    const { data: collegeData, error: collegeError } = await supabase
      .from('colleges')
      .upsert({
        code: tempCode ? null : code, // Only insert code if it's not a temp code
        temp_code: tempCode,
        name: name,
        status: status,
        contact_phones: phones.length > 0 ? phones : null,
      }, { onConflict: 'code', ignoreDuplicates: false })
      .select('id')
      .single()

    if (collegeError) {
      // If code was missing and we hit a unique constraint, try fetching by temp_code
      console.error(`Failed to insert college ${code}:`, collegeError.message)
      skippedCount++
      continue
    }

    const collegeId = collegeData.id
    importedCount++

    // Insert Emails
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i]
      const { error: emailError } = await supabase
        .from('college_emails')
        .upsert({
          college_id: collegeId,
          email: email,
          is_primary: i === 0, // First email is primary
        }, { onConflict: 'email' })

      if (emailError) {
         console.warn(`Warning: Could not insert email ${email}: ${emailError.message}`)
      }

      // Check suspicious emails
      if (isSuspiciousEmail(email)) {
        await supabase.from('import_issues').insert({
          import_batch_id: batchId,
          raw_row: { code, name, rawEmail },
          issue_type: 'SUSPICIOUS_EMAIL',
          message: `Email domain looks like a typo: ${email}`
        })
        flaggedCount++
      }
    }
  }

  console.log("\n--- Import Summary ---")
  console.log(`Total Rows Processed: ${dataLines.length}`)
  console.log(`Successfully Imported/Updated: ${importedCount}`)
  console.log(`Skipped: ${skippedCount}`)
  console.log(`Flagged Issues: ${flaggedCount} (Check 'import_issues' table in Supabase)`)
}

runImport()
