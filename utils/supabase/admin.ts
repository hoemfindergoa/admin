import { createClient } from '@supabase/supabase-js'

/**
 * Supabase admin client using the service-role key.
 * ONLY use this in server-side code (server actions, API routes).
 * Never expose this to the browser.
 */
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
