"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: any
  profile: any
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  signOut: async () => {},
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          // Fetch user profile when auth state changes
          try {
            const { data } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()
            setProfile(data)
          } catch (error) {
            console.error("Error fetching profile:", error)
          }
        } else {
          setProfile(null)
        }

        setLoading(false)
      })

      // Initial session check
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          setUser(session?.user ?? null)

          if (session?.user) {
            // Fetch user profile on initial load
            supabase
              .from("user_profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()
              .then(({ data }) => {
                setProfile(data)
                setLoading(false)
              })
              .catch((error) => {
                console.error("Error fetching profile:", error)
                setLoading(false)
              })
          } else {
            setLoading(false)
          }
        })
        .catch((error) => {
          console.error("Error getting session:", error)
          setLoading(false)
        })

      return () => {
        subscription?.unsubscribe()
      }
    } catch (error) {
      console.error("Error setting up auth:", error)
      setLoading(false)
      return () => {}
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, profile, signOut, loading }}>{children}</AuthContext.Provider>
}
