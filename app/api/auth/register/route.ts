import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Register the user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    // Handle registration errors
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Check if user was created
    if (data.user) {
      return NextResponse.json(
        {
          message: "Registration successful!",
          user: {
            id: data.user.id,
            email: data.user.email,
          },
        },
        { status: 201 },
      )
    } else {
      return NextResponse.json(
        { message: "Registration successful! Please check your email for confirmation." },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An unexpected error occurred during registration" }, { status: 500 })
  }
}
