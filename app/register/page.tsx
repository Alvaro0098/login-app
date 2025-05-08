"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
// Phone validation regex (basic)
const PHONE_REGEX = /^\+?[0-9]{10,15}$/

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Validate phone number
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!PHONE_REGEX.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number"
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // Step 1: Register the user with minimal data
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Step 2: If registration was successful, update user metadata
      if (data.user && data.user.id) {
        try {
          // Update user metadata
          const { error: metadataError } = await supabase.auth.updateUser({
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phoneNumber,
              full_name: `${formData.firstName} ${formData.lastName}`,
            },
          })

          if (metadataError) {
            console.error("Error updating user metadata:", metadataError)
            // Continue even if metadata update fails
          }
        } catch (updateError) {
          console.error("Error in user metadata update:", updateError)
          // Continue even if update fails
        }
      }

      // Handle successful registration
      setMessage({
        text: data.message || "Registration successful!",
        type: "success",
      })

      // Redirect to login page after successful registration
      if (data.status !== "CONFIRMATION_REQUIRED") {
        setTimeout(() => {
          router.push("/signup")
        }, 2000)
      }
    } catch (error: any) {
      setMessage({
        text: error.message || "Failed to sign up",
        type: "error",
      })
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
            <form className="space-y-4" onSubmit={handleRegister}>
              {message && (
                <Alert
                  className={
                    message.type === "error"
                      ? "bg-red-50 text-red-800 border-red-200"
                      : "bg-green-50 text-green-800 border-green-200"
                  }
                >
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
                <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className={`h-11 px-4 transition-all border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50 ${
                    errors.phoneNumber ? "border-red-500" : ""
                  }`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
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
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link href="/signup" className="font-medium text-purple-600 hover:text-purple-800 transition-colors">
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
