import { NextResponse } from "next/server"

// This is a CORS proxy for the webhook
export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData = await request.json()

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return NextResponse.json({ error: "First name, last name, email, and password are required" }, { status: 400 })
    }

    console.log("Proxying registration data to webhook")

    // Forward the request to the webhook
    const response = await fetch("https://alvaro98.app.n8n.cloud/webhook-test/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || "",
        password: formData.password,
      }),
    })

    // Get the response from the webhook
    const responseData = await response.text()
    let parsedData

    try {
      // Try to parse as JSON
      parsedData = JSON.parse(responseData)
    } catch (e) {
      // If not JSON, use the text
      parsedData = { message: responseData }
    }

    // Return the webhook response with appropriate status
    return NextResponse.json(parsedData, { status: response.status })
  } catch (error: any) {
    console.error("Proxy error:", error)
    return NextResponse.json({ error: "Proxy error", details: error.message }, { status: 500 })
  }
}
