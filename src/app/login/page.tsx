"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

// Default credentials based on reference-erp UsersTableSeeder
// These match the default users created in the seeder
const DEFAULT_CREDENTIALS = [
  {
    email: "superadmin@example.com",
    password: "1234",
    type: "super admin",
    name: "Super Admin",
  },
  {
    email: "company@example.com",
    password: "1234",
    type: "company",
    name: "Company",
  },
  {
    email: "client@example.com",
    password: "1234",
    type: "client",
    name: "Client",
  },
  {
    email: "employee@example.com",
    password: "1234",
    type: "employee",
    name: "Employee",
  },
] as const

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset all states when component mounts (e.g., after logout)
  useEffect(() => {
    // Clear any existing success state and loading state
    setShowSuccess(false)
    setIsLoading(false)
    setError("")
    
    // Clear form if coming from logout (no user in sessionStorage)
    if (typeof window !== "undefined") {
      const user = sessionStorage.getItem("user")
      if (!user) {
        // User is logged out, reset form completely
        setEmail("")
        setPassword("")
      } else {
        // If user is already logged in, redirect immediately
        router.replace("/hrm-dashboard")
      }
    }

    // Cleanup function to reset states on unmount
    return () => {
      setShowSuccess(false)
      setIsLoading(false)
      setError("")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check credentials against default users
      const user = DEFAULT_CREDENTIALS.find(
        (cred) => cred.email === email.toLowerCase() && cred.password === password
      )

      if (!user) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      // Store user info in sessionStorage (in production, use proper auth system)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("user", JSON.stringify({
          email: user.email,
          name: user.name,
          type: user.type,
        }))
      }

      // Show success animation
      setShowSuccess(true)
      
      // Redirect while overlay is still visible to prevent flashing
      // Wait for animation to fully appear (after all animations complete ~0.8s), then redirect
      // Redirect happens while overlay is still visible, preventing any flash
      setTimeout(() => {
        // Use replace instead of push to prevent back navigation
        // Keep showSuccess true - overlay will remain until Next.js unmounts the component
        // This ensures no flash of login page before redirect
        router.replace("/hrm-dashboard")
      }, 1000) // Redirect after main animation completes but before exit animation
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden"
      style={{ 
        // Prevent any flashing during transition
        minHeight: '100dvh', // Dynamic viewport height for mobile
      }}
    >
      {/* Success Overlay Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
            style={{ 
              // Ensure full coverage and prevent any content from showing through
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100dvh',
              // Fully opaque to prevent any content showing through
              backgroundColor: 'rgb(255, 255, 255)',
              // Prevent any pointer events to underlying content
              pointerEvents: 'auto',
              // Ensure it's above everything
              isolation: 'isolate',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                delay: 0.1 
              }}
              className="flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
                className="relative"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ 
                    duration: 0.5,
                    delay: 0.3,
                    times: [0, 0.5, 1]
                  }}
                  className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 0] }}
                  transition={{ 
                    duration: 0.6,
                    delay: 0.4,
                    times: [0, 0.3, 1]
                  }}
                  className="absolute inset-0 rounded-full bg-green-200"
                />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Login Successful!
                </h3>
                <p className="text-sm text-gray-600">
                  Redirecting to dashboard...
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decorative elements */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ 
          opacity: showSuccess ? 0 : 1, 
          visibility: showSuccess ? 'hidden' : 'visible',
          transition: 'opacity 0.15s, visibility 0.15s' 
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header with Logo */}
      <header 
        className="relative z-10 p-6"
        style={{ 
          opacity: showSuccess ? 0 : 1, 
          visibility: showSuccess ? 'hidden' : 'visible',
          transition: 'opacity 0.15s, visibility 0.15s' 
        }}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/avatars/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="text-xl font-bold text-gray-900">ERP System</span>
            </Link>
            {/* Language selector can be added here if needed */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 flex items-center justify-center relative z-10 px-4 py-12"
        style={{
          // Ensure content is below overlay when it appears
          position: 'relative',
          zIndex: showSuccess ? 1 : 10,
          opacity: showSuccess ? 0 : 1,
          visibility: showSuccess ? 'hidden' : 'visible',
          transition: 'opacity 0.15s, visibility 0.15s',
        }}
      >
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
              <p className="text-sm text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading || showSuccess}
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading || showSuccess}
                  autoComplete="current-password"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="blue"
                  className="w-full h-11 font-medium shadow-sm"
                  disabled={isLoading || showSuccess}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>

              {/* Register Link (optional, can be controlled by settings) */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} ERP System. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
