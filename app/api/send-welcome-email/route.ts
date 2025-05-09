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
    const { name, email } = await request.json()

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    try {
      // Get the Resend client (will throw if API key is missing)
      const resendClient = getResendClient()

      // Send the welcome email
      const { data, error } = await resendClient.emails.send({
        from: `Alvaro Garces <${FROM_EMAIL}>`,
        to: [email],
        subject: `Welcome to Alvaro Garces, ${name}!`,
        html: getWelcomeEmailHtml(name),
      })

      if (error) {
        console.error("Resend API error:", error)
        return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully",
        data,
      })
    } catch (emailError: any) {
      console.error("Email service error:", emailError.message)
      return NextResponse.json(
        {
          error: "Email service configuration error",
          details: emailError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}

// HTML template for the welcome email
function getWelcomeEmailHtml(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
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
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to Alvaro Garces!</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Thank you for subscribing to our newsletter! We're excited to have you join our community.</p>
        <p>You'll now receive updates, news, and special offers directly to your inbox.</p>
        <p>If you have any questions or need assistance, feel free to reply to this email.</p>
        <p>Best regards,<br>Alvaro Garces Team</p>
        <a href="https://${DOMAIN}" class="button">Visit Our Website</a>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Alvaro Garces. All rights reserved.</p>
        <p>You're receiving this email because you signed up for our newsletter.</p>
      </div>
    </body>
    </html>
  `
}
