import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Use the provided environment variables directly
const supabaseUrl = "https://tdbhrgeomfiqhluyurjm.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmhyZ2VvbWZpcWhsdXl1cmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NDU0NDcsImV4cCI6MjA2MjIyMTQ0N30.gIaksE_idTcvOMFvO5pEghvs3oF3OiMwe4Tl5T7Ds1Q"

// Create a server client for server-side usage
export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Handle cookies.set error in middleware
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Handle cookies.delete error in middleware
        }
      },
    },
  })
}
