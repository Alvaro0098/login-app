import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This requires the service role key which has admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function POST(request: Request) {
  try {
    // Get the email from the request
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if the service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Service role key is not configured" }, { status: 500 })
    }

    // Get the user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from("auth.users")
      .select("id, email, email_confirmed_at")
      .eq("email", email)
      .single()

    if (userError) {
      return NextResponse.json({ error: "Error finding user: " + userError.message }, { status: 400 })
    }

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If the email is already confirmed, return success
    if (userData.email_confirmed_at) {
      return NextResponse.json({
        message: "Email already confirmed",
        user: { id: userData.id, email: userData.email },
      })
    }

    // Confirm the user's email using the admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userData.id, {
      email_confirmed_at: new Date().toISOString(),
    })

    if (updateError) {
      return NextResponse.json({ error: "Error confirming email: " + updateError.message }, { status: 400 })
    }

    return NextResponse.json({
      message: "Email confirmed successfully",
      user: { id: userData.id, email: userData.email },
    })
  } catch (error: any) {
    console.error("Error in admin-confirm API:", error)
    return NextResponse.json({ error: "An unexpected error occurred: " + error.message }, { status: 500 })
  }
}
