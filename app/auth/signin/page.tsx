"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "PENDING_APPROVAL") {
          const errorMsg = "Your organizer account is pending admin approval. Please wait for approval to login."
          setError(errorMsg)
          toast.error(errorMsg)
        } else if (result.error === "REJECTED") {
          const errorMsg = "Your organizer application was rejected. Please contact support."
          setError(errorMsg)
          toast.error(errorMsg)
        } else {
          const errorMsg = "Invalid email or password"
          setError(errorMsg)
          toast.error(errorMsg)
        }
        setLoading(false)
      } else {
        // Success - redirect to callback URL
        toast.success("Successfully signed in!")
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      const errorMsg = "An error occurred. Please try again."
      setError(errorMsg)
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your EventGhor account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="bg-[#ff7c07] hover:bg-[#e66f06] w-full text-white" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              New to EventGhor? Create an account to get started
            </div>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href={`/auth/signup/user?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-[#ff7c07] hover:text-[#e66f06]">
                Sign up
              </Link> 
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
