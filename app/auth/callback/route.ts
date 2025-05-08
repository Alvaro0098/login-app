import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// This route handles the callback from magic link authentication
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to the dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
