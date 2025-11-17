"use client"

import type React from "react"
import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2, X, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RichTextEditor from "@/components/ui/rich-text-editor"
import { useToast } from "@/hooks/use-toast"
import imageCompression from "browser-image-compression"
import Image from "next/image"

interface Event {
  _id: string
  title: string
  description: string
  image: string
  date: string
  time?: string
  startTime?: string
  endTime?: string
  location: string
  locationLink?: string
  category: string
  ticketType: "FREE" | "PREMIUM"
  ticketPrice?: number
  bkashNumber?: string
  hasTicketLimit: boolean
  totalTickets?: number
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [ticketType, setTicketType] = useState<"FREE" | "PREMIUM">("FREE")
  const [hasTicketLimit, setHasTicketLimit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Helper function to convert 12-hour format with AM/PM to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return ''
    
    const [time, modifier] = time12h.split(' ')
    let [hours, minutes] = time.split(':')
    
    if (hours === '12') {
      hours = '00'
    }
    
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12)
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`
  }

  useEffect(() => {
    fetchEvent()
  }, [resolvedParams.id])

  const fetchEvent = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/organizers/events/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success && data.event) {
        const eventData = data.event
        setEvent(eventData)
        setDescription(eventData.description)
        setTicketType(eventData.ticketType)
        setHasTicketLimit(eventData.hasTicketLimit)
        setPosterPreview(eventData.image)
        setUploadedImageUrl(eventData.image)
      } else {
        toast({
          title: "Error",
          description: "Event not found",
          variant: "destructive",
        })
        router.push("/organizer/attendees")
      }
    } catch (error) {
      console.error("Error fetching event:", error)
      toast({
        title: "Error",
        description: "Failed to load event",
        variant: "destructive",
      })
      router.push("/organizer/attendees")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploadingImage(true)
        
        const previewUrl = URL.createObjectURL(file)
        setPosterPreview(previewUrl)

        const maxSizeInMB = 10
        const fileSizeInMB = file.size / (1024 * 1024)
        let fileToUpload = file

        if (fileSizeInMB > maxSizeInMB) {
          const options = {
            maxSizeMB: maxSizeInMB,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          }
          const compressedFile = await imageCompression(file, options)
          fileToUpload = compressedFile
        }

        const uploadFormData = new FormData()
        uploadFormData.append("file", fileToUpload)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image")
        }

        const uploadData = await uploadResponse.json()
        setUploadedImageUrl(uploadData.url)

        toast({
          title: "Image uploaded successfully",
          description: "Your event poster has been updated.",
        })
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
        setPosterPreview(event?.image || null)
        setUploadedImageUrl(event?.image || null)
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const handleRemoveImage = () => {
    setPosterPreview(event?.image || null)
    setUploadedImageUrl(event?.image || null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!uploadedImageUrl) {
        throw new Error("Please upload an event poster")
      }

      const formData = new FormData(e.currentTarget)
      
      // Helper function to convert 24-hour time to 12-hour format with AM/PM
      const convertTo12Hour = (time24: string): string => {
        const [hours, minutes] = time24.split(':')
        const hour = parseInt(hours, 10)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const hour12 = hour % 12 || 12
        return `${hour12}:${minutes} ${ampm}`
      }

      const startTime = formData.get("startTime") as string
      const endTime = formData.get("endTime") as string

      const updateData = {
        title: formData.get("title"),
        description: description,
        image: uploadedImageUrl,
        date: formData.get("date"),
        startTime: startTime ? convertTo12Hour(startTime) : undefined,
        endTime: endTime ? convertTo12Hour(endTime) : undefined,
        location: formData.get("location"),
        locationLink: formData.get("locationLink"),
        category: formData.get("category"),
        ticketType: ticketType,
        hasTicketLimit: hasTicketLimit,
      }

      if (ticketType === "PREMIUM") {
        Object.assign(updateData, { 
          ticketPrice: parseFloat(formData.get("ticketPrice") as string),
          bkashNumber: formData.get("bkashNumber") as string
        })
      }

      if (hasTicketLimit) {
        Object.assign(updateData, { totalTickets: parseInt(formData.get("totalTickets") as string, 10) })
      }

      const response = await fetch(`/api/organizers/events/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update event")
      }

      toast({
        title: "Success!",
        description: "Event updated successfully",
      })

      router.push("/organizer/attendees")
      router.refresh()
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Edit Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Poster Upload */}
            <div className="space-y-2">
              <Label htmlFor="poster">
                Event Poster <span className="text-red-500">*</span>
              </Label>
              {posterPreview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed">
                  <Image src={posterPreview} alt="Event poster" fill className="object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="poster"
                  className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="mb-2 h-12 w-12 animate-spin text-purple-600" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-2 h-12 w-12 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </label>
              )}
              <Input
                id="poster"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploadingImage}
              />
            </div>

            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter event title"
                defaultValue={event.title}
                required
              />
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Event Description <span className="text-red-500">*</span>
              </Label>
              <RichTextEditor value={description} onChange={setDescription} />
            </div>

            {/* Event Date & Time */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Event Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={event.date}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    defaultValue={event.startTime ? convertTo24Hour(event.startTime) : ''}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">
                    End Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue={event.endTime ? convertTo24Hour(event.endTime) : ''}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="Event venue or address"
                defaultValue={event.location}
                required
              />
            </div>

            {/* Location Link */}
            <div className="space-y-2">
              <Label htmlFor="locationLink">Google Maps Link (Optional)</Label>
              <div className="mb-2 text-sm text-muted-foreground">
                <p>Get the share link from Google Maps to display an embedded map on your event page</p>
              </div>
              <Input
                id="locationLink"
                name="locationLink"
                type="url"
                placeholder="https://maps.app.goo.gl/..."
                defaultValue={event.locationLink || ""}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                name="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={event.category}
                required
              >
                <option value="">Select a category</option>
                <option value="Music">Music</option>
                <option value="Arts">Arts</option>
                <option value="Sports">Sports</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Food">Food & Drink</option>
                <option value="Education">Education</option>
                <option value="Health">Health & Wellness</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Ticket Type */}
            <div className="space-y-4">
              <Label>
                Ticket Type <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ticketType"
                    value="FREE"
                    checked={ticketType === "FREE"}
                    onChange={() => setTicketType("FREE")}
                    className="h-4 w-4"
                  />
                  <span>Free Event</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ticketType"
                    value="PREMIUM"
                    checked={ticketType === "PREMIUM"}
                    onChange={() => setTicketType("PREMIUM")}
                    className="h-4 w-4"
                  />
                  <span>Paid Event</span>
                </label>
              </div>

              {ticketType === "PREMIUM" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">
                      Ticket Price (৳) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ticketPrice"
                      name="ticketPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      defaultValue={event.ticketPrice}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bkashNumber">
                      Bkash Number (for receiving payments) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bkashNumber"
                      name="bkashNumber"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      pattern="^01[0-9]{9}$"
                      maxLength={11}
                      defaultValue={event.bkashNumber}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the Bkash number where you want to receive ticket payments
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Ticket Limit */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTicketLimit}
                  onChange={(e) => setHasTicketLimit(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Set ticket limit</span>
              </label>

              {hasTicketLimit && (
                <div className="space-y-2">
                  <Label htmlFor="totalTickets">
                    Total Tickets Available <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="totalTickets"
                    name="totalTickets"
                    type="number"
                    min="1"
                    placeholder="Enter number of tickets"
                    defaultValue={event.totalTickets}
                    required
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || isUploadingImage}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Event...
                </>
              ) : (
                "Update Event"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
