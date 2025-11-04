"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Upload } from "lucide-react"

interface SignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin: () => void
}

export default function SignupModal({ open, onOpenChange, onSwitchToLogin }: SignupModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nidNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [nidPhoto, setNidPhoto] = useState<File | null>(null)
  const [personalPhoto, setPersonalPhoto] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "nid" | "personal") => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === "nid") setNidPhoto(file)
      else setPersonalPhoto(file)
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Signup:", { ...formData, nidPhoto, personalPhoto })
    // Handle signup logic here
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Account</DialogTitle>
          <DialogDescription>Sign up as an event organizer</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nidNumber">National ID Number</Label>
            <Input
              id="nidNumber"
              name="nidNumber"
              placeholder="Enter your NID number"
              value={formData.nidNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nidPhoto">National ID Photo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="nidPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "nid")}
                className="hidden"
              />
              <Label
                htmlFor="nidPhoto"
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                {nidPhoto ? nidPhoto.name : "Upload NID Photo"}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalPhoto">Personal Photo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="personalPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "personal")}
                className="hidden"
              />
              <Label
                htmlFor="personalPhoto"
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                {personalPhoto ? personalPhoto.name : "Upload Personal Photo"}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="gradient-primary w-full text-white">
            Create Account
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <button onClick={onSwitchToLogin} className="font-semibold text-purple-600 hover:underline">
            Sign In
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
