import { createClient } from "@supabase/supabase-js"

// These environment variables need to be set in your project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tdbhrgeomfiqhluyurjm.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseServiceKey) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will not work.")
}

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
