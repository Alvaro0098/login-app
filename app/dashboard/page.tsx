"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, UserIcon, Calendar, BarChart3, Settings, Bell, TrendingUp, Users, DollarSign } from "lucide-react"
import { DynamicBackground, type MetricStatus } from "@/components/dynamic-background"
import { MetricCard } from "@/components/metric-card"
import { TaskTable } from "@/components/task-table"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [greeting, setGreeting] = useState("")

  // State for metrics and background
  const [metrics, setMetrics] = useState({
    revenue: { value: 24500, trend: 12.5 },
    users: { value: 1250, trend: 8.3 },
    conversion: { value: 3.2, trend: -2.1 },
    engagement: { value: 78, trend: 5.7 },
  })
  const [backgroundStatus, setBackgroundStatus] = useState<MetricStatus>("neutral")
  const [backgroundIntensity, setBackgroundIntensity] = useState(70)

  // Update background based on selected metric
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  useEffect(() => {
    // Update background based on selected metric or overall trend
    if (selectedMetric) {
      const metric = metrics[selectedMetric as keyof typeof metrics]
      if (metric.trend > 10) {
        setBackgroundStatus("positive")
        setBackgroundIntensity(70 + metric.trend / 2)
      } else if (metric.trend < 0) {
        setBackgroundStatus("negative")
        setBackgroundIntensity(70 + Math.abs(metric.trend))
      } else if (metric.trend > 5) {
        setBackgroundStatus("warning")
        setBackgroundIntensity(70 + metric.trend)
      } else {
        setBackgroundStatus("neutral")
        setBackgroundIntensity(70)
      }
    } else {
      // Calculate overall trend
      const avgTrend =
        Object.values(metrics).reduce((sum, metric) => sum + metric.trend, 0) / Object.values(metrics).length

      if (avgTrend > 7) {
        setBackgroundStatus("positive")
      } else if (avgTrend < 0) {
        setBackgroundStatus("negative")
      } else if (avgTrend > 4) {
        setBackgroundStatus("warning")
      } else {
        setBackgroundStatus("neutral")
      }

      setBackgroundIntensity(70)
    }
  }, [selectedMetric, metrics])

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

  // Simulate metric changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        setMetrics((prev) => {
          const newMetrics = { ...prev }
          // Randomly update one metric
          const keys = Object.keys(newMetrics)
          const randomKey = keys[Math.floor(Math.random() * keys.length)] as keyof typeof newMetrics
          const randomChange = (Math.random() * 2 - 1) * 2 // Between -2 and 2

          newMetrics[randomKey] = {
            ...newMetrics[randomKey],
            trend: Number.parseFloat((newMetrics[randomKey].trend + randomChange).toFixed(1)),
          }

          return newMetrics
        })
      }
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [loading])

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

  // Handle metric card click
  const handleMetricClick = (metricKey: string) => {
    setSelectedMetric(selectedMetric === metricKey ? null : metricKey)
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
    <DynamicBackground metricStatus={backgroundStatus} intensity={backgroundIntensity}>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {greeting},{" "}
              <span className="text-white/90">
                {firstName}
                {lastName ? ` ${lastName}` : " there"}!
              </span>
            </h1>
            <p className="text-white/80 mt-1">
              Welcome to your personal dashboard
              {selectedMetric && (
                <Button
                  variant="link"
                  className="text-white/80 p-0 h-auto ml-2 underline"
                  onClick={() => setSelectedMetric(null)}
                >
                  (Reset view)
                </Button>
              )}
            </p>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <MetricCard
              title="Revenue"
              value={`$${metrics.revenue.value.toLocaleString()}`}
              icon={<DollarSign className="h-6 w-6" />}
              trend={metrics.revenue.trend}
              status={
                metrics.revenue.trend > 10
                  ? "positive"
                  : metrics.revenue.trend < 0
                    ? "negative"
                    : metrics.revenue.trend > 5
                      ? "warning"
                      : "neutral"
              }
              onClick={() => handleMetricClick("revenue")}
              className={selectedMetric === "revenue" ? "ring-2 ring-white/50" : ""}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MetricCard
              title="Active Users"
              value={metrics.users.value.toLocaleString()}
              icon={<Users className="h-6 w-6" />}
              trend={metrics.users.trend}
              status={
                metrics.users.trend > 10
                  ? "positive"
                  : metrics.users.trend < 0
                    ? "negative"
                    : metrics.users.trend > 5
                      ? "warning"
                      : "neutral"
              }
              onClick={() => handleMetricClick("users")}
              className={selectedMetric === "users" ? "ring-2 ring-white/50" : ""}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MetricCard
              title="Conversion Rate"
              value={`${metrics.conversion.value}%`}
              icon={<TrendingUp className="h-6 w-6" />}
              trend={metrics.conversion.trend}
              status={
                metrics.conversion.trend > 10
                  ? "positive"
                  : metrics.conversion.trend < 0
                    ? "negative"
                    : metrics.conversion.trend > 5
                      ? "warning"
                      : "neutral"
              }
              onClick={() => handleMetricClick("conversion")}
              className={selectedMetric === "conversion" ? "ring-2 ring-white/50" : ""}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <MetricCard
              title="Engagement"
              value={`${metrics.engagement.value}%`}
              icon={<BarChart3 className="h-6 w-6" />}
              trend={metrics.engagement.trend}
              status={
                metrics.engagement.trend > 10
                  ? "positive"
                  : metrics.engagement.trend < 0
                    ? "negative"
                    : metrics.engagement.trend > 5
                      ? "warning"
                      : "neutral"
              }
              onClick={() => handleMetricClick("engagement")}
              className={selectedMetric === "engagement" ? "ring-2 ring-white/50" : ""}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <TaskTable />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </DynamicBackground>
  )
}
