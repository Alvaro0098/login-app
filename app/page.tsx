import Link from "next/link"
import { Button } from "@/components/ui/button"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function Home() {
  // Supabase is now always configured
  const supabaseConfigured = isSupabaseConfigured()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-5xl font-bold mb-6">Welcome to Our App</h1>
        <p className="text-xl mb-8">Sign up or log in to get started</p>

        <div className="flex gap-4 justify-center">
          <Button asChild className="bg-white text-purple-600 hover:bg-gray-100">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild className="bg-transparent border-2 border-white hover:bg-white/10">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
