"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        router.push("/signup")
        return
      }

      if (!session) {
        router.push("/signup")
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/signup")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Loading...</p>
      </div>
    )
  }

  // Get user data from metadata (since we're storing everything there now)
  const firstName = user?.user_metadata?.first_name || ""
  const lastName = user?.user_metadata?.last_name || ""
  const phone = user?.user_metadata?.phone || "" // Updated to match the column name
  const fullName = `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0] || "User"

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 p-4 sm:p-6 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome, {fullName}</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p>{user?.email}</p>
            </div>
            {firstName && (
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p>
                  {firstName} {lastName}
                </p>
              </div>
            )}
            {phone && (
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p>{phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Account Created</p>
              <p>{new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard content would go here */}
        <Card>
          <CardHeader>
            <CardTitle>Your Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
