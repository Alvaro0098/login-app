import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email, password, firstName, lastName, phoneNumber } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Store user data in session storage for later use
    // This approach completely separates auth from profile creation
    const userData = {
      firstName,
      lastName,
      phoneNumber,
      email,
    }

    // Use the most basic signUp call possible
    // This minimizes the chance of database errors
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    // Handle registration errors
    if (error) {
      console.error("Supabase registration error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Check if user was created
    if (data.user) {
      // Return success with the user data
      // We'll handle profile creation client-side after successful auth
      return NextResponse.json(
        {
          message: "Registration successful! Please check your email for confirmation.",
          status: data.user.confirmation_sent_at ? "CONFIRMATION_REQUIRED" : "REGISTERED",
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          userData: userData, // Return the user data for client-side storage
        },
        { status: 201 },
      )
    } else {
      console.warn("No user data returned from Supabase")
      return NextResponse.json(
        {
          message: "Registration initiated but user data is unavailable.",
          status: "UNKNOWN",
        },
        { status: 201 },
      )
    }
  } catch (error: any) {
    console.error("Unexpected registration error:", error.message || error)
    return NextResponse.json({ error: "An unexpected error occurred during registration" }, { status: 500 })
  }
}
