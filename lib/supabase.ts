import { createClient } from "@supabase/supabase-js"

// The issue is that these environment variables are not being properly loaded or are undefined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tdbhrgeomfiqhluyurjm.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmhyZ2VvbWZpcWhsdXl1cmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NDU0NDcsImV4cCI6MjA2MjIyMTQ0N30.gIaksE_idTcvOMFvO5pEghvs3oF3OiMwe4Tl5T7Ds1Q"

// Log the URL (but not the key for security)
console.log("Initializing Supabase with URL:", supabaseUrl)

// Create a Supabase client with proper error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Test the connection to make sure it's working
const testConnection = async () => {
  try {
    // Simple health check
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Supabase connection test failed:", error.message)
    } else {
      console.log("Supabase connection successful")
    }
  } catch (err: any) {
    console.error("Supabase connection test error:", err.message || err)
  }
}

// Only run in browser environment
if (typeof window !== "undefined") {
  // Execute the test after a short delay to ensure the client is initialized
  setTimeout(testConnection, 100)
}
