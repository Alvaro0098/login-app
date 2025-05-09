import { NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend with API key - handle it safely for build time
let resend: Resend

// This function ensures we only initialize Resend when the API is actually called
// This prevents build-time errors when environment variables aren't available
function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }

    resend = new Resend(apiKey)
  }
  return resend
}

// The verified domain and from email
const FROM_EMAIL = "contacto@alvarogarces.site"
const DOMAIN = "alvarogarces.site"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { firstName, lastName, phone, email, password } = await request.json()

    console.log("Processing registration for:", { firstName, lastName, email, phone: phone ? "✓" : "✗" })

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      console.error("Missing required fields:", {
        firstName: !!firstName,
        lastName: !!lastName,
        email: !!email,
        password: !!password,
      })
      return NextResponse.json({ error: "First name, last name, email, and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email)
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    console.log("Sending welcome email to:", email)

    // Send the welcome email
    try {
      // Get the Resend client (will throw if API key is missing)
      const resendClient = getResendClient()

      const { data, error } = await resendClient.emails.send({
        from: `Alvaro Garces <${FROM_EMAIL}>`,
        to: [email],
        subject: `Welcome to our platform, ${firstName}!`,
        html: getWelcomeEmailHtml(firstName, lastName),
      })

      if (error) {
        console.error("Resend API error:", error)
        return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 })
      }

      console.log("Email sent successfully:", data?.id)

      // In a real application, you would save the user to a database here
      // For this demo, we'll just return success

      return NextResponse.json({
        success: true,
        message: "Registration successful and welcome email sent",
        data: {
          emailId: data?.id,
          user: {
            firstName,
            lastName,
            email,
            phone: phone || null,
          },
        },
      })
    } catch (emailError: any) {
      console.error("Email service error:", emailError.message)
      return NextResponse.json(
        {
          error: "Email service configuration error",
          details: emailError.message,
          partial: true,
          user: { firstName, lastName, email },
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Unexpected error during registration:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}

// HTML template for the welcome email
function getWelcomeEmailHtml(firstName: string, lastName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Alvaro Garces</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(to right, #6366f1, #8b5cf6, #ec4899);
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 5px 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 15px;
        }
        @media only screen and (max-width: 480px) {
          body {
            padding: 10px;
          }
          .header, .content {
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to Alvaro Garces!</h1>
      </div>
      <div class="content">
        <p>Hello ${firstName} ${lastName},</p>
        <p>Thank you for registering with us! We're excited to have you join our community.</p>
        <p>Your account has been successfully created and is ready to use.</p>
        <p>If you have any questions or need assistance, feel free to reply to this email.</p>
        <p>Best regards,<br>The Alvaro Garces Team</p>
        <a href="https://${DOMAIN}" class="button">Visit Our Website</a>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Alvaro Garces. All rights reserved.</p>
        <p>You're receiving this email because you registered on our platform.</p>
      </div>
    </body>
    </html>
  `
}
