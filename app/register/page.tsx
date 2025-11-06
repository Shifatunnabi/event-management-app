"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserCircle, Building2 } from "lucide-react"
import { toast } from "sonner"

type UserType = "USER" | "ORGANIZER" | null

export default function RegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<UserType>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    nidNumber: "",
    organizationName: "",
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
          userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      toast.success(data.message)

      // Redirect based on user type
      if (userType === "ORGANIZER") {
        // For organizer, show pending message and redirect to signin
        setTimeout(() => {
          router.push("/auth/signin")
        }, 2000)
      } else {
        // For regular user, redirect to signin
        setTimeout(() => {
          router.push("/auth/signin")
        }, 1500)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 1: Select user type
  if (!userType) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Create Account</h1>
            <p className="text-muted-foreground">Choose how you want to join EventGhor</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Regular User Card */}
            <Card
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg "
              onClick={() => setUserType("USER")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <UserCircle className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">Register as User</CardTitle>
                <CardDescription>Buy tickets, apply for jobs, and explore events</CardDescription>
              </CardHeader>
              {/* <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Purchase event tickets</li>
                  <li>✓ Apply for event jobs</li>
                  <li>✓ Manage your bookings</li>
                  <li>✓ Instant account activation</li>
                </ul>
              </CardContent> */}
            </Card>

            {/* Organizer Card */}
            <Card
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg "
              onClick={() => setUserType("ORGANIZER")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10">
                  <Building2 className="h-10 w-10 text-orange-500" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">Register as Event Organizer</CardTitle>
                <CardDescription className="pb-4">Create events, post jobs, and manage attendees</CardDescription>
              </CardHeader>
              {/* <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Create and manage events</li>
                  <li>✓ Post job opportunities</li>
                  <li>✓ Track ticket sales</li>
                  <li>⚠ Requires admin approval</li>
                </ul>
              </CardContent> */}
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Show registration form
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => setUserType(null)} className="mb-4">
          ← Back to selection
        </Button>
        <h1 className="mb-2 text-2xl font-bold md:text-4xl">
          {userType === "USER" ? "User Registration" : "Organizer Registration"}
        </h1>
        <p className="text-muted-foreground">Fill in your details to create an account</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields */}
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

            {/* Organizer-specific fields */}
            {userType === "ORGANIZER" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nidNumber">NID Number *</Label>
                  <Input
                    id="nidNumber"
                    name="nidNumber"
                    placeholder="1234567890123"
                    value={formData.nidNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    placeholder="ABC Events Ltd."
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

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

            {userType === "ORGANIZER" && (
              <div className="rounded-lg bg-orange-50 p-4 text-sm text-orange-800">
                <p className="font-semibold">Note:</p>
                <p>
                  Your account will be pending approval from the admin. You won't be able to login until your account
                  is approved.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full bg-[#ff7c07] hover:bg-[#e66f06]" size="lg" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/auth/signin" className="text-primary hover:underline">
                Sign in here
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
