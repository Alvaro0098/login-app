"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  })
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({
    type: null,
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: null, message: "" })

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address")
      }

      // Send registration data and welcome email
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setStatus({
        type: "success",
        message: "Registration successful! Welcome email sent.",
      })

      // Reset form on success
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      setStatus({
        type: "error",
        message: error.message || "Failed to register. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>

      {status.type && (
        <Alert
          className={`mb-4 ${
            status.type === "success" ? "bg-green-500/20 text-green-50" : "bg-red-500/20 text-red-50"
          } border-0 flex items-start`}
        >
          {status.type === "success" ? (
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white">
              First Name <span className="text-red-300">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white">
              Last Name <span className="text-red-300">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white">
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email Address <span className="text-red-300">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Password <span className="text-red-300">*</span>
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/20"
          />
          <p className="text-xs text-white/70">Password must be at least 8 characters long</p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </div>
  )
}
