import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Check if we can get the auth settings
    const { data, error } = await supabase.from("auth.config").select("*").single()

    if (error) {
      // If we can't access auth.config, try a different approach
      return NextResponse.json({
        message: "Unable to check auth settings directly. Try registering a test user.",
        error: error.message,
      })
    }

    return NextResponse.json({
      message: "Auth settings retrieved successfully",
      settings: data,
    })
  } catch (error: any) {
    return NextResponse.json({
      message: "Error checking auth settings",
      error: error.message,
    })
  }
}
