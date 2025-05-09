import { createClient as createBrowserClient } from "@supabase/supabase-js"

// Use the provided environment variables directly
const supabaseUrl = "https://tdbhrgeomfiqhluyurjm.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmhyZ2VvbWZpcWhsdXl1cmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NDU0NDcsImV4cCI6MjA2MjIyMTQ0N30.gIaksE_idTcvOMFvO5pEghvs3oF3OiMwe4Tl5T7Ds1Q"

// Create the Supabase client directly
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Export a function to check if Supabase is configured
export function isSupabaseConfigured() {
  return true // We're now using hardcoded values, so it's always configured
}
