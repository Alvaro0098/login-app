import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    console.log("Received registration request with data:", JSON.stringify(body))

    const { email, password, firstName, lastName, phoneNumber } = body

    // Validate required fields
    if (!email || !password) {
      console.log("Missing required fields: email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Log Supabase connection info (without exposing credentials)
    console.log("Attempting to register user with Supabase")

    try {
      // Register the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
          },
        },
      })

      // Handle registration errors
      if (error) {
        console.error("Supabase registration error:", error.message)
        console.error("Error details:", JSON.stringify(error))

        // Handle rate limit error specifically
        if (error.message.includes("rate limit") || error.message.includes("too many requests")) {
          return NextResponse.json(
            {
              error: "Too many registration attempts. Please try again later or use a different email address.",
              code: "RATE_LIMIT_EXCEEDED",
            },
            { status: 429 }, // Too Many Requests status code
          )
        }

        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      console.log("User registered successfully:", data.user?.id)

      // Try to insert the user profile data
      if (data.user) {
        try {
          console.log("Inserting profile data for user:", data.user.id)

          // Create profile data object matching your table structure
          const profileDataToInsert = {
            id: data.user.id, // Using the user's UUID as the id
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
            created_at: new Date().toISOString(),
          }

          // Log the profile data being inserted
          console.log("Profile data to insert:", JSON.stringify(profileDataToInsert))

          // Insert the profile data
          const { data: profileData, error: profileError } = await supabase
            .from("user_profile")
            .insert(profileDataToInsert)

          if (profileError) {
            console.error("Error inserting profile data:", JSON.stringify(profileError))
          } else {
            console.log("Profile created successfully")
          }
        } catch (profileErr) {
          console.error("Exception creating profile:", profileErr)
        }
      }

      // Return success response
      return NextResponse.json({
        message: "Registration successful! Please check your email to confirm your account.",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      })
    } catch (supabaseError) {
      console.error("Unexpected Supabase error:", supabaseError)
      return NextResponse.json({ error: "Error connecting to authentication service" }, { status: 500 })
    }
  } catch (error) {
    console.error("Unexpected error during registration:", error)
    return NextResponse.json({ error: "An unexpected error occurred during registration" }, { status: 500 })
  }
}
