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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Check if the user exists in user_profiles
      if (data.user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (profileError && profileError.code !== "PGRST116") {
            // PGRST116 is "no rows returned"
            console.error("Error checking profile:", profileError)
          }

          // If profile doesn't exist, create it using user metadata
          if (!profileData) {
            const metadata = data.user.user_metadata || {}

            const { error: insertError } = await supabase.from("user_profiles").insert({
              id: data.user.id,
              first_name: metadata.first_name || "",
              last_name: metadata.last_name || "",
              phone: metadata.phone || "",
            })

            if (insertError) {
              console.error("Error creating profile:", insertError)
              // Continue even if profile creation fails
            }
          }
        } catch (profileErr) {
          console.error("Error handling profile:", profileErr)
          // Continue even if profile handling fails
        }

        // Show success message and redirect to dashboard
        setMessage({ text: "Successfully signed in!", type: "success" })
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        setMessage({ text: "Invalid email or password", type: "error" })
      } else if (error.message.includes("Email not confirmed")) {
        setMessage({ text: "Please confirm your email before logging in", type: "error" })
      } else {
        setMessage({ text: error.message || "Failed to sign in", type: "error" })
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
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
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
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 px-4 transition-all border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 px-4 transition-all border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-purple-600 hover:text-purple-800 transition-colors">
                Register now
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
