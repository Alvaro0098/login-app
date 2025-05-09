"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, CheckCircleIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

// The production webhook URL
const WEBHOOK_URL = "https://alvaro98.app.n8n.cloud/webhook/register"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Mock mode is now disabled by default since we're using the production webhook
  const [mockMode, setMockMode] = useState(false)

  // Show info message when component mounts
  useEffect(() => {
    setMessage({
      text: "Using production webhook for reliable registration.",
      type: "info",
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))

    // Clear specific field error when user types
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate required fields
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"

    // Validate email format
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const toggleMockMode = () => {
    setMockMode(!mockMode)
    setMessage({
      text: !mockMode
        ? "Mock mode enabled. Registration will be simulated without calling the webhook."
        : "Mock mode disabled. Using production webhook for registration.",
      type: "info",
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setMessage(null)
    setDebugInfo(null)

    // Prepare the data for the webhook
    const webhookData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || "", // Ensure phone is never undefined
      password: formData.password,
    }

    // If mock mode is enabled, simulate a successful registration
    if (mockMode) {
      setTimeout(() => {
        setDebugInfo("Mock mode: Simulating successful registration without calling webhook")
        setMessage({
          text: "Registration successful! (Mock Mode)",
          type: "success",
        })
        setIsLoading(false)

        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }, 1500) // Simulate network delay
      return
    }

    try {
      // First try using our server-side API route
      console.log("Attempting registration via server-side API route...")
      setDebugInfo("Sending registration data via server-side API route...")

      const apiResponse = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      })

      const responseData = await apiResponse.json()

      if (!apiResponse.ok) {
        throw new Error(`API route failed: ${responseData.error || responseData.details || apiResponse.statusText}`)
      }

      console.log("Registration successful via API route:", responseData)
      setDebugInfo(`Registration successful! Response: ${JSON.stringify(responseData)}`)

      // Show success message
      setMessage({
        text: "Registration successful! Welcome email sent.",
        type: "success",
      })

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (apiError: any) {
      console.error("API route error:", apiError)
      setDebugInfo(`API route error: ${apiError.message}. Trying direct webhook...`)

      // If server-side approach fails, try direct webhook as fallback
      try {
        console.log("Attempting direct webhook call as fallback...")
        setDebugInfo((prev) => `${prev}\nAttempting direct webhook call to ${WEBHOOK_URL}...`)

        const directResponse = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(webhookData),
        })

        let responseText = await directResponse.text()
        let responseJson

        try {
          responseJson = JSON.parse(responseText)
          responseText = JSON.stringify(responseJson)
        } catch (e) {
          // If not JSON, use text as is
        }

        if (!directResponse.ok) {
          throw new Error(`Direct webhook failed: ${directResponse.status} ${responseText}`)
        }

        console.log("Direct webhook call successful:", responseText)
        setDebugInfo((prev) => `${prev}\nDirect webhook call successful: ${responseText}`)

        setMessage({
          text: "Registration successful! Welcome email sent.",
          type: "success",
        })

        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } catch (directError: any) {
        console.error("Direct webhook error:", directError)
        setDebugInfo((prev) => `${prev}\nDirect webhook error: ${directError.message}`)
        setMessage({
          text: "Registration failed. Please try again or enable mock mode.",
          type: "error",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600">Register to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <InfoIcon className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Registration Options</AlertTitle>
              <AlertDescription className="text-blue-700">
                <p className="mb-2">
                  Using production webhook for reliable registration. You can enable mock mode for testing.
                </p>
                <div className="flex items-center justify-between mt-2 p-2 bg-white rounded border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={mockMode}
                      onCheckedChange={toggleMockMode}
                      className={mockMode ? "bg-green-600" : "bg-gray-400"}
                    />
                    <span className="font-medium">Mock Mode</span>
                  </div>
                  <span className={`text-sm ${mockMode ? "text-green-600" : "text-gray-600"} font-medium`}>
                    {mockMode ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </AlertDescription>
            </Alert>

            <form className="space-y-4" onSubmit={handleRegister}>
              {message && (
                <Alert
                  className={
                    message.type === "error"
                      ? "bg-red-50 text-red-800 border-red-200"
                      : message.type === "info"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : "bg-green-50 text-green-800 border-green-200"
                  }
                >
                  {message.type === "success" && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                  {message.type === "error" && <InfoIcon className="h-4 w-4 text-red-600" />}
                  {message.type === "info" && <InfoIcon className="h-4 w-4 text-blue-600" />}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={`h-11 px-4 transition-all border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50 ${
                      errors.firstName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={`h-11 px-4 transition-all border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50 ${
                      errors.lastName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`h-11 px-4 transition-all border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+123456789"
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-11 px-4 transition-all border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`h-11 px-4 transition-all border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`h-11 px-4 transition-all border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>

              {mockMode && (
                <div className="text-center text-sm text-green-600 font-medium mt-2 flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Mock Mode Active: Registration will be simulated
                </div>
              )}
            </form>

            {debugInfo && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-700 whitespace-pre-wrap">
                <p className="font-semibold">Debug Info:</p>
                {debugInfo}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-800 transition-colors">
                Sign in
              </Link>
            </div>
            <div className="text-center text-sm text-gray-600">
              By continuing, you agree to our{" "}
              <a href="#" className="font-medium text-purple-600 hover:text-purple-800 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-medium text-purple-600 hover:text-purple-800 transition-colors">
                Privacy Policy
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
