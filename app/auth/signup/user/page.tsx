"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { signIn } from "next-auth/react"

export default function UserRegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userType: "USER",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      toast.success(data.message)

      // Auto-login after successful registration
      const loginResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (loginResult?.ok) {
        toast.success("Logging you in...")
        setTimeout(() => {
          router.push(callbackUrl)
          router.refresh()
        }, 500)
      } else {
        // Fallback to signin page if auto-login fails
        setTimeout(() => {
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)
        }, 1500)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>
        <h1 className="mb-2 text-2xl font-bold md:text-4xl">User Registration</h1>
        <p className="text-muted-foreground">Create your account to purchase tickets and more</p>
      </div>

      <Card>
        <CardContent className="pt-2">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Already have an account?{" "}
            <a href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-[#ff7c07] hover:underline font-bold">
              Sign in here
            </a>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+880 1234 567890"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter your full address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full bg-[#ff7c07] hover:bg-[#e66f06]" size="lg" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Want to organize events?{" "}
              <a href="/register" className="text-[#ff7c07] hover:underline font-bold">
                Register as Organizer
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
