"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, UserIcon, Calendar, BarChart3, Settings, Bell } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")

    // Check if user is logged in
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error fetching session:", error)
          router.push("/signup")
          return
        }

        if (!session) {
          router.push("/signup")
          return
        }

        // Get user details
        const {
          data: { user: userData },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !userData) {
          console.error("Error fetching user:", userError)
          router.push("/signup")
          return
        }

        setUser(userData)

        // Extract first name and last name from metadata or email
        if (userData.user_metadata?.first_name) {
          // Check if first_name might contain both first and last name
          const fullNameParts = userData.user_metadata.first_name.trim().split(/\s+/)
          if (fullNameParts.length > 1) {
            // If it contains spaces, treat it as full name
            setFirstName(capitalizeFirstLetter(fullNameParts[0]))
            setLastName(capitalizeFirstLetter(fullNameParts.slice(1).join(" ")))
          } else {
            setFirstName(capitalizeFirstLetter(userData.user_metadata.first_name))

            // Get last name if available
            if (userData.user_metadata?.last_name) {
              setLastName(capitalizeFirstLetter(userData.user_metadata.last_name))
            }
          }
        } else if (userData.user_metadata?.firstName) {
          // Check if firstName might contain both first and last name
          const fullNameParts = userData.user_metadata.firstName.trim().split(/\s+/)
          if (fullNameParts.length > 1) {
            // If it contains spaces, treat it as full name
            setFirstName(capitalizeFirstLetter(fullNameParts[0]))
            setLastName(capitalizeFirstLetter(fullNameParts.slice(1).join(" ")))
          } else {
            setFirstName(capitalizeFirstLetter(userData.user_metadata.firstName))

            // Get last name if available
            if (userData.user_metadata?.lastName) {
              setLastName(capitalizeFirstLetter(userData.user_metadata.lastName))
            }
          }
        } else if (userData.user_metadata?.full_name) {
          // Handle full_name field if present
          const fullNameParts = userData.user_metadata.full_name.trim().split(/\s+/)
          if (fullNameParts.length > 1) {
            setFirstName(capitalizeFirstLetter(fullNameParts[0]))
            setLastName(capitalizeFirstLetter(fullNameParts.slice(1).join(" ")))
          } else {
            setFirstName(capitalizeFirstLetter(userData.user_metadata.full_name))
          }
        } else if (userData.user_metadata?.name) {
          // Handle name field if present
          const fullNameParts = userData.user_metadata.name.trim().split(/\s+/)
          if (fullNameParts.length > 1) {
            setFirstName(capitalizeFirstLetter(fullNameParts[0]))
            setLastName(capitalizeFirstLetter(fullNameParts.slice(1).join(" ")))
          } else {
            setFirstName(capitalizeFirstLetter(userData.user_metadata.name))
          }
        } else if (userData.email) {
          // Extract name from email (before @)
          const emailName = userData.email.split("@")[0]

          // First check if the email name contains recognizable separators
          if (emailName.includes(".") || emailName.includes("_") || emailName.includes("-")) {
            // Split by common separators and capitalize each part
            const nameParts = emailName.split(/[._-]/)
            if (nameParts.length > 0) {
              // Remove numbers/special chars and capitalize
              setFirstName(capitalizeFirstLetter(nameParts[0].replace(/[^a-zA-Z]/g, "")))

              // If there's a second part, use it as last name
              if (nameParts.length > 1) {
                setLastName(capitalizeFirstLetter(nameParts[1].replace(/[^a-zA-Z]/g, "")))
              }
            }
          } else {
            // Try to detect camelCase or PascalCase (e.g., "johnDoe" or "JohnDoe")
            const camelCaseMatch = emailName.match(/([A-Z]?[a-z]+)([A-Z][a-z]+)/)
            if (camelCaseMatch && camelCaseMatch.length >= 3) {
              setFirstName(capitalizeFirstLetter(camelCaseMatch[1]))
              setLastName(capitalizeFirstLetter(camelCaseMatch[2]))
            } else {
              // If all else fails, just use the email name as first name
              setFirstName(capitalizeFirstLetter(emailName.replace(/[^a-zA-Z]/g, "")))
            }
          }
        }

        // Add a final check to split combined names
        // This will catch cases where the name is stored as "PedroCarlos" without spaces
        if (firstName && !lastName && firstName.length > 10) {
          // Try to detect camelCase in the first name (e.g., "pedroCarlos")
          const camelCaseMatch = firstName.match(/([a-z]+)([A-Z][a-z]+)/)
          if (camelCaseMatch && camelCaseMatch.length >= 3) {
            setFirstName(capitalizeFirstLetter(camelCaseMatch[1]))
            setLastName(capitalizeFirstLetter(camelCaseMatch[2]))
          } else {
            // Try to detect PascalCase in the first name (e.g., "PedroCarlos")
            const pascalCaseMatch = firstName.match(/([A-Z][a-z]+)([A-Z][a-z]+)/)
            if (pascalCaseMatch && pascalCaseMatch.length >= 3) {
              setFirstName(capitalizeFirstLetter(pascalCaseMatch[1]))
              setLastName(capitalizeFirstLetter(pascalCaseMatch[2]))
            }
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Session check error:", err)
        router.push("/signup")
      }
    }

    checkUser()
  }, [router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/signup")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string: string) => {
    if (!string) return ""
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
              <Skeleton className="h-60" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {greeting},{" "}
              <span className="text-white/90">
                {firstName}
                {lastName ? ` ${lastName}` : " there"}!
              </span>
            </h1>
            <p className="text-white/80 mt-1">Welcome to your personal dashboard</p>
          </motion.div>

          <Button
            variant="outline"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              title: "Profile",
              icon: <UserIcon className="h-6 w-6 text-indigo-500" />,
              color: "from-indigo-500/20 to-indigo-600/20",
            },
            {
              title: "Calendar",
              icon: <Calendar className="h-6 w-6 text-purple-500" />,
              color: "from-purple-500/20 to-purple-600/20",
            },
            {
              title: "Analytics",
              icon: <BarChart3 className="h-6 w-6 text-pink-500" />,
              color: "from-pink-500/20 to-pink-600/20",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card
                className={`bg-gradient-to-br ${item.color} backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 h-full`}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center h-40">
                  <div className="bg-white/90 p-3 rounded-full mb-4">{item.icon}</div>
                  <h3 className="text-lg font-medium text-white">{item.title}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        i === 0
                          ? "bg-indigo-100 text-indigo-600"
                          : i === 1
                            ? "bg-purple-100 text-purple-600"
                            : "bg-pink-100 text-pink-600"
                      }`}
                    >
                      {i === 0 ? (
                        <UserIcon className="h-5 w-5" />
                      ) : i === 1 ? (
                        <Calendar className="h-5 w-5" />
                      ) : (
                        <BarChart3 className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {i === 0 ? "Profile updated" : i === 1 ? "New event scheduled" : "Analytics report ready"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {i === 0 ? "2 hours ago" : i === 1 ? "Yesterday" : "3 days ago"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
