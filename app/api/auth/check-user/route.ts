import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: Request) {
  try {
    // Get email from query params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server is not configured for admin operations" }, { status: 500 })
    }

    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin
      .from("auth.users")
      .select("id, email, email_confirmed_at, created_at")
      .eq("email", email)
      .single()

    if (authError && authError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error checking auth.users:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    return NextResponse.json({
      exists: !!authUser,
      user: authUser || null,
    })
  } catch (error) {
    console.error("Unexpected error checking user:", error)
    return NextResponse.json({ error: "An unexpected error occurred while checking user" }, { status: 500 })
  }
}
