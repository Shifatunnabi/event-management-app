"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"

interface ApplyFeatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ApplyFeatureModal({ open, onOpenChange }: ApplyFeatureModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    serviceName: "",
    category: "",
    phone: "",
    email: "",
    location: "",
    description: "",
    priceRange: "",
  })
  const [portfolio, setPortfolio] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPortfolio(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Apply Feature:", { ...formData, portfolio })
    // Handle application submission
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Apply to be Featured</DialogTitle>
          <DialogDescription>Submit your information to be listed in our vendor directory</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceName">Service/Business Name</Label>
            <Input
              id="serviceName"
              name="serviceName"
              placeholder="Your business name"
              value={formData.serviceName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">Select a category</option>
              <option value="Photographer">Photographer</option>
              <option value="Cinematographer">Cinematographer</option>
              <option value="Caterer">Caterer</option>
              <option value="Decorator">Decorator</option>
              <option value="Audio/Visual">Audio/Visual</option>
              <option value="Event Planner">Event Planner</option>
              <option value="Bakery">Bakery</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Florist">Florist</option>
            </select>
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="City, Country"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceRange">Price Range</Label>
            <select
              id="priceRange"
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">Select price range</option>
              <option value="$ - Budget">$ - Budget</option>
              <option value="$$ - Moderate">$$ - Moderate</option>
              <option value="$$$ - Premium">$$$ - Premium</option>
              <option value="$$$$ - Luxury">$$$$ - Luxury</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell us about your services..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio/Photos (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input id="portfolio" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
              <Label
                htmlFor="portfolio"
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                {portfolio ? portfolio.name : "Upload Portfolio"}
              </Label>
            </div>
          </div>

          <Button type="submit" className="gradient-primary w-full text-white">
            Submit Application
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
