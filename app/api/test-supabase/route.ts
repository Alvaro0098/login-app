import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Supabase connection failed",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Check environment variables (without exposing them)
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    return NextResponse.json({
      status: "success",
      message: "Supabase connection successful",
      environmentVariables: envCheck,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Test failed",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
