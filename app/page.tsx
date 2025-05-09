"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import RegisterForm from "@/components/register-form"

export default function Home() {
  const [activeForm, setActiveForm] = useState<"login" | "register">("login")

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
          <p className="text-white/80">Sign in to your account or create a new one</p>
        </div>

        {/* Form Selector */}
        <div className="bg-white/20 p-1 rounded-lg mb-6 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveForm("login")}
              className={`py-2 px-4 rounded-md text-center transition-all ${
                activeForm === "login"
                  ? "bg-white text-indigo-600 font-medium shadow-sm"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveForm("register")}
              className={`py-2 px-4 rounded-md text-center transition-all ${
                activeForm === "register"
                  ? "bg-white text-indigo-600 font-medium shadow-sm"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl overflow-hidden">
          {activeForm === "login" ? <LoginForm /> : <RegisterForm />}
        </div>

        <div className="mt-8 text-center text-sm text-white/70">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </main>
  )
}
