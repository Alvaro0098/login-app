import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { userId, firstName, lastName, email, phoneNumber } = await request.json()

    // Validate required fields
    if (!userId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "User ID, first name, last name, and email are required" }, { status: 400 })
    }

    // Insert the profile data
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber || null,
      })
      .select()

    if (error) {
      console.error("Error creating profile:", error)

      // Try upsert as a fallback
      const { data: upsertData, error: upsertError } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: userId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: phoneNumber || null,
          },
          { onConflict: "id" },
        )
        .select()

      if (upsertError) {
        return NextResponse.json(
          {
            error: "Failed to create profile",
            details: upsertError.message,
            code: upsertError.code,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "Profile created via upsert",
        profile: upsertData,
      })
    }

    return NextResponse.json({
      message: "Profile created successfully",
      profile: data,
    })
  } catch (error: any) {
    console.error("Unexpected error creating profile:", error)
    return NextResponse.json({ error: "An unexpected error occurred", details: error.message }, { status: 500 })
  }
}
