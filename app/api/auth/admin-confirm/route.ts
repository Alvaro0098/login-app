import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Get the email from the request
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if the required environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase admin credentials")
      return NextResponse.json(
        { error: "Server configuration error: Missing authentication credentials" },
        { status: 500 },
      )
    }

    // Initialize the Supabase admin client inside the handler function
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

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
