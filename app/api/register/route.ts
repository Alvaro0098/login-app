import { NextResponse } from "next/server"

// The production webhook URL
const WEBHOOK_URL = "https://alvaro98.app.n8n.cloud/webhook/register"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData = await request.json()

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return NextResponse.json({ error: "First name, last name, email, and password are required" }, { status: 400 })
    }

    console.log("Sending registration data to webhook:", {
      ...formData,
      password: "********", // Log masked password for security
    })

    // Send data to the webhook with improved error handling
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || "", // Ensure phone is never undefined
          password: formData.password,
        }),
      })

      // Get response text first
      const responseText = await response.text()
      console.log(`Webhook response (${response.status}):`, responseText)

      // Try to parse as JSON if possible
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        // If not JSON, use the text as is
        responseData = { message: responseText }
      }

      // Check for HTTP errors
      if (!response.ok) {
        console.error(`Webhook error (${response.status}):`, responseText)
        return NextResponse.json(
          {
            error: `Webhook request failed with status: ${response.status}`,
            details: responseText,
            url: WEBHOOK_URL,
          },
          { status: response.status },
        )
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Registration successful! Welcome email sent.",
        data: responseData,
      })
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError)
      return NextResponse.json(
        {
          error: "Failed to connect to webhook",
          details: fetchError.message,
          url: WEBHOOK_URL,
          tip: "This may be due to CORS restrictions, network issues, or an incorrect webhook URL.",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An unexpected error occurred", details: error.message }, { status: 500 })
  }
}
