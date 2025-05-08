import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email, password } = await request.json()

    console.log("Admin API received registration request for:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server is not configured for admin operations" }, { status: 500 })
    }

    // Register the user with Supabase Admin API (bypasses email confirmation)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirms the email
      user_metadata: {
        registered_at: new Date().toISOString(),
      },
    })

    // Handle registration errors
    if (error) {
      console.error("Admin registration error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Check if user was created
    if (data.user) {
      return NextResponse.json(
        {
          message: "Registration successful! You can now log in.",
          user: {
            id: data.user.id,
            email: data.user.email,
          },
        },
        { status: 201 },
      )
    } else {
      return NextResponse.json({ error: "Failed to create user" }, { status: 400 })
    }
  } catch (error) {
    console.error("Unexpected admin registration error:", error)
    return NextResponse.json({ error: "An unexpected error occurred during registration" }, { status: 500 })
  }
}
