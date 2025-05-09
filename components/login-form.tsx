"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function LoginForm() {
  const [formData, setFormData] = useState({
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
      // Simulate login process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, always succeed
      setStatus({
        type: "success",
        message: "Login successful!",
      })
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Failed to login. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>

      {status.type && (
        <Alert
          className={`mb-4 ${
            status.type === "success" ? "bg-green-500/20 text-green-50" : "bg-red-500/20 text-red-50"
          } border-0`}
        >
          {status.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email Address
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <a href="#" className="text-xs text-white/70 hover:text-white">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/20"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  )
}
