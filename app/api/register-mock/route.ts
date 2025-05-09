import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData = await request.json()

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return NextResponse.json({ error: "First name, last name, email, and password are required" }, { status: 400 })
    }

    console.log("Mock registration data received:", {
      ...formData,
      password: "********", // Log masked password for security
    })

    // Simulate a successful registration without calling the actual webhook
    return NextResponse.json({
      success: true,
      message: "Registration successful! Welcome email sent.",
      data: {
        userId: "mock-user-" + Math.random().toString(36).substring(2, 10),
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        registeredAt: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An unexpected error occurred", details: error.message }, { status: 500 })
  }
}
