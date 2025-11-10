"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CreateEventPage() {
  const router = useRouter()
  const [poster, setPoster] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPoster(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Create Event submitted")
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl md:text-4xl text-center font-bold">Create New Event</h1>
        <p className="text-muted-foreground text-center">Fill in the details to create your event</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Event Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Poster */}
            <div className="space-y-2">
              <Label htmlFor="poster">Event Poster</Label>
              <div className="flex items-center gap-2">
                <Input id="poster" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <Label
                  htmlFor="poster"
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-8 text-sm hover:bg-accent"
                >
                  <Upload className="h-6 w-6" />
                  <span>{poster ? poster.name : "Upload Event Poster"}</span>
                </Label>
              </div>
            </div>

            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" placeholder="Enter event title" required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your event..." rows={6} required />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Event venue address" required />
            </div>

            {/* Date and Time */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date</Label>
                <Input id="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Event Time</Label>
                <Input id="time" type="time" required />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select a category</option>
                <option value="music">Music</option>
                <option value="tech">Tech Events</option>
                <option value="food">Food & Drink</option>
                <option value="business">Business</option>
                <option value="sports">Sports</option>
                <option value="arts">Performing & Visual Arts</option>
              </select>
            </div>

            {/* Ticket Information */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Ticket Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Ticket Price ($)</Label>
                  <Input id="price" type="number" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Available Tickets</Label>
                  <Input id="quantity" type="number" placeholder="100" min="1" required />
                </div>
              </div>
            </div>

            <Button type="submit" className="bg-[#ff7c07] hover:bg-[#e66f06] w-full text-white" size="lg">
              Create Event
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
