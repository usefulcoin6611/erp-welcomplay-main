"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // TODO: Implement actual password reset API call
      // This should send a password reset link to the email
      console.log("Password reset request:", { email })
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Show success message
      setSuccess("We have emailed your password reset link.")
      setEmail("")
    } catch (err) {
      setError("Email not found or error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header with Logo */}
      <header className="relative z-10 p-6">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
              <p className="text-sm text-gray-600">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-Mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="blue"
                  className="w-full h-11 font-medium shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Password Reset Link"}
                </Button>
              </div>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Back to{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Login
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
