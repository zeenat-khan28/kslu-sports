import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * WARNING: This client uses the Service Role Key.
 * It bypasses ALL Row Level Security (RLS) rules.
 * ONLY use this in secure server environments (e.g., Server Actions, API routes, Cron jobs).
 * NEVER import this file into a Client Component.
 */
export const createAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
