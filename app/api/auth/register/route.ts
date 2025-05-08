import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { email, password } = body

    console.log("API received registration request for:", email)

    // Validate input
    if (!email || !password) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Register the user with Supabase
    console.log("Calling Supabase auth.signUp...")
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // You can add additional data here if needed
        data: {
          registered_at: new Date().toISOString(),
        },
      },
    })

    // Log the full response for debugging
    console.log(
      "Supabase signUp response:",
      JSON.stringify(
        {
          user: data.user
            ? {
                id: data.user.id,
                email: data.user.email,
                emailConfirmed: data.user.email_confirmed_at,
                confirmationSent: data.user.confirmation_sent_at,
              }
            : null,
          error: error ? { message: error.message, code: error.code } : null,
        },
        null,
        2,
      ),
    )

    // Handle registration errors
    if (error) {
      console.error("Supabase registration error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Check if user was created and what state they're in
    if (data.user) {
      // By default, Supabase requires email confirmation
      if (data.user.confirmation_sent_at && !data.user.email_confirmed_at) {
        return NextResponse.json(
          {
            message: "Registration successful! Please check your email for confirmation.",
            status: "CONFIRMATION_REQUIRED",
            user: {
              id: data.user.id,
              email: data.user.email,
            },
          },
          { status: 201 },
        )
      } else {
        return NextResponse.json(
          {
            message: "Registration successful!",
            status: "REGISTERED",
            user: {
              id: data.user.id,
              email: data.user.email,
            },
          },
          { status: 201 },
        )
      }
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
  } catch (error) {
    console.error("Unexpected registration error:", error)
    return NextResponse.json({ error: "An unexpected error occurred during registration" }, { status: 500 })
  }
}
