import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email, password, firstName, lastName, phoneNumber } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get the admin client
    let supabaseAdmin
    try {
      supabaseAdmin = getSupabaseAdmin()
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Failed to initialize admin client" }, { status: 500 })
    }

    // Create the user with admin privileges (bypassing email confirmation)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
      },
    })

    // Handle registration errors
    if (error) {
      console.error("Admin registration error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Try to insert the user profile data
    try {
      console.log("Inserting profile data for user:", data.user.id)

      // Create profile data object matching your table structure
      const profileData = {
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        created_at: new Date().toISOString(),
      }

      // Insert the profile data
      const { error: profileError } = await supabaseAdmin.from("user_profile").insert(profileData)

      if (profileError) {
        console.error("Error inserting profile data:", profileError)
      } else {
        console.log("Profile created successfully")
      }
    } catch (profileErr) {
      console.error("Exception creating profile:", profileErr)
    }

    // Return success response
    return NextResponse.json({
      message: "User created successfully (email confirmation bypassed)",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error) {
    console.error("Unexpected error during admin registration:", error)
    return NextResponse.json({ error: "An unexpected error occurred during registration" }, { status: 500 })
  }
}
