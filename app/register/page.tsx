"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  })
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "warning" } | null>(null)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setTimeout(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [cooldown])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error message when user types
    if (message?.type === "error") {
      setMessage(null)
    }
  }

  const generateTestEmail = () => {
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 8)
    const testEmail = `test+${randomString}${timestamp}@example.com`

    setFormData((prev) => ({
      ...prev,
      email: testEmail,
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Don't allow registration during cooldown
    if (cooldown > 0) return

    setLoading(true)
    setMessage(null)

    try {
      // Log the data being sent
      console.log("Sending registration data:", JSON.stringify(formData))

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      // Log the raw response for debugging
      console.log("Registration response status:", response.status)

      const data = await response.json()
      console.log("Registration response data:", JSON.stringify(data))

      if (!response.ok) {
        // Check for rate limit error
        if (response.status === 429 || data.code === "RATE_LIMIT_EXCEEDED") {
          setCooldown(60) // Set a 60-second cooldown
          setMessage({
            text: data.error || "Too many registration attempts. Please wait or use a different email.",
            type: "warning",
          })
        } else {
          setMessage({
            text: data.error || "Registration failed. Please try again.",
            type: "error",
          })
        }
        return
      }

      setMessage({
        text: data.message || "Registration successful!",
        type: "success",
      })

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/signup")
      }, 2000)
    } catch (error) {
      console.error("Client-side error during registration:", error)
      setMessage({
        text: "An unexpected error occurred. Please try again.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Enter your information to create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+1 (555) 123-4567"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="email">Email</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateTestEmail}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Generate test email
                </Button>
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
            </div>

            {message && (
              <Alert
                className={`
                ${message.type === "success" ? "bg-green-50 text-green-800 border-green-200" : ""}
                ${message.type === "error" ? "bg-red-50 text-red-800 border-red-200" : ""}
                ${message.type === "warning" ? "bg-yellow-50 text-yellow-800 border-yellow-200" : ""}
              `}
              >
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {cooldown > 0 && (
              <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                <AlertDescription>
                  Rate limit reached. Please wait {cooldown} seconds before trying again, or use a different email.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={loading || cooldown > 0}
            >
              {loading ? "Creating Account..." : cooldown > 0 ? `Wait ${cooldown}s` : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
