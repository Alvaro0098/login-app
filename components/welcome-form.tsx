"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function WelcomeForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
      const response = await fetch("/api/send-welcome-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      setStatus({
        type: "success",
        message: "Welcome email sent successfully! Please check your inbox.",
      })

      // Reset form
      setFormData({ name: "", email: "" })
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-md border border-gray-200 p-6">
      {status.type && (
        <div
          className={`mb-4 p-4 rounded-md ${
            status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          <p className="text-sm">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
            className="w-full"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Sending..." : "Subscribe & Get Welcome Email"}
        </Button>
      </form>
    </div>
  )
}
