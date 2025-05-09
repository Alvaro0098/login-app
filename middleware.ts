import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const res = NextResponse.next()

    // Use the same hardcoded credentials as in lib/supabase.ts
    const supabaseUrl = "https://tdbhrgeomfiqhluyurjm.supabase.co"
    const supabaseAnonKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmhyZ2VvbWZpcWhsdXl1cmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NDU0NDcsImV4cCI6MjA2MjIyMTQ0N30.gIaksE_idTcvOMFvO5pEghvs3oF3OiMwe4Tl5T7Ds1Q"

    const supabase = createMiddlewareClient(
      { req, res },
      {
        supabaseUrl,
        supabaseKey: supabaseAnonKey,
      },
    )

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If accessing a protected route and not logged in, redirect to login
    if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If accessing login/register while logged in, redirect to dashboard
    if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    // If there's an error, just continue without redirecting
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

// Specify the paths this middleware should run on
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
