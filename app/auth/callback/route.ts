import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Use the provided environment variables directly
const supabaseUrl = "https://tdbhrgeomfiqhluyurjm.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmhyZ2VvbWZpcWhsdXl1cmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NDU0NDcsImV4cCI6MjA2MjIyMTQ0N30.gIaksE_idTcvOMFvO5pEghvs3oF3OiMwe4Tl5T7Ds1Q"

// This route handles the callback from magic link authentication
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient(
        { cookies: () => cookieStore },
        {
          supabaseUrl,
          supabaseKey: supabaseAnonKey,
        },
      )

      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code)
    }

    // Redirect to the dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Error in auth callback:", error)
    // Redirect to login on error
    return NextResponse.redirect(new URL("/login", request.url))
  }
}
