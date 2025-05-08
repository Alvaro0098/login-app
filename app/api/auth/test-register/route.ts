import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST() {
  try {
    // Generate a random test email
    const testEmail = `test+${Math.random().toString(36).substring(2, 10)}@example.com`
    const testPassword = "Password123!"

    // Try to register a test user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    if (error) {
      return NextResponse.json(
        {
          message: "Error registering test user",
          error: error.message,
        },
        { status: 400 },
      )
    }

    // Check if email confirmation is required
    const emailConfirmationRequired = data.user?.confirmation_sent_at && !data.user?.email_confirmed_at

    return NextResponse.json({
      message: "Test registration successful",
      emailConfirmationRequired,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        emailConfirmed: !!data.user?.email_confirmed_at,
        confirmationSent: !!data.user?.confirmation_sent_at,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error in test registration",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
