"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RichTextEditor from "@/components/ui/rich-text-editor"
import { useToast } from "@/hooks/use-toast"
import imageCompression from "browser-image-compression"
import Image from "next/image"

export default function CreateEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [poster, setPoster] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [ticketType, setTicketType] = useState<"FREE" | "PREMIUM">("FREE")
  const [hasTicketLimit, setHasTicketLimit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploading(true)
        
        // Create preview
        const previewUrl = URL.createObjectURL(file)
        setPosterPreview(previewUrl)

        // Compress image if larger than 10MB
        const maxSizeInMB = 10
        const fileSizeInMB = file.size / (1024 * 1024)

        let fileToUpload = file

        if (fileSizeInMB > maxSizeInMB) {
          toast({
            title: "Compressing image...",
            description: "Your image is being compressed to optimize upload.",
          })

          const options = {
            maxSizeMB: maxSizeInMB,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          }

          const compressedFile = await imageCompression(file, options)
          fileToUpload = compressedFile

          toast({
            title: "Image compressed successfully",
            description: `Size reduced from ${fileSizeInMB.toFixed(2)}MB to ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`,
          })
        }

        setPoster(fileToUpload)

        // Upload to Cloudinary immediately
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
          description: "Your event poster has been uploaded.",
        })
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
        // Reset on error
        setPoster(null)
        setPosterPreview(null)
        setUploadedImageUrl(null)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleRemoveImage = () => {
    setPoster(null)
    setPosterPreview(null)
    setUploadedImageUrl(null)
    if (posterPreview) {
      URL.revokeObjectURL(posterPreview)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!uploadedImageUrl) {
        throw new Error("Please upload an event poster")
      }

      const formData = new FormData(e.currentTarget)
      formData.set("description", description)
      formData.set("imageUrl", uploadedImageUrl)

      // Debug: Log form data
      console.log("Form data being sent:")
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }

      const response = await fetch("/api/organizers/events", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      console.log("API Response:", data)

      if (!response.ok) {
        console.error("API Error:", data)
        throw new Error(data.error || "Failed to create event")
      }

      toast({
        title: "Success!",
        description: "Event created successfully",
      })

      router.push("/organizer/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
              
              {posterPreview ? (
                <div className="relative w-full">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-input">
                    <Image
                      src={posterPreview}
                      alt="Event poster preview"
                      fill
                      className="object-cover"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {uploadedImageUrl && (
                    <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      Image uploaded successfully
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <Input 
                    id="poster" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    disabled={isUploading}
                  />
                  <Label
                    htmlFor="poster"
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-8 text-sm hover:bg-accent"
                  >
                    <Upload className="h-6 w-6" />
                    <span>Upload Event Poster</span>
                  </Label>
                </>
              )}
              
              <p className="text-xs text-muted-foreground">
                Images larger than 10MB will be automatically compressed and uploaded
              </p>
            </div>

            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="title" placeholder="Enter event title" required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe your event..."
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Event venue address" required />
            </div>

            {/* Location Link (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="locationLink">Google Maps Location Link (Optional)</Label>
              <div className="mb-2 text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Instructions:</p>
                <ol className="list-decimal list-inside space-y-0.5 ml-2">
                  <li>Open Google Maps</li>
                  <li>Search your location</li>
                  <li>Click Share</li>
                  <li>Copy the link and paste here</li>
                </ol>
              </div>
              <Input
                id="locationLink"
                name="locationLink"
                placeholder="https://maps.app.goo.gl/..."
                type="url"
              />
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" name="startTime" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" name="endTime" type="time" required />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g., Music, Tech Events, Food & Drink, Business, Sports, Arts"
                required
              />
            </div>

            {/* Ticket Information */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Ticket Information</h3>

              {/* Ticket Type */}
              <div className="space-y-2">
                <Label>Ticket Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ticketType"
                      value="FREE"
                      checked={ticketType === "FREE"}
                      onChange={(e) => setTicketType(e.target.value as "FREE" | "PREMIUM")}
                      className="h-4 w-4"
                    />
                    <span>Free</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ticketType"
                      value="PREMIUM"
                      checked={ticketType === "PREMIUM"}
                      onChange={(e) => setTicketType(e.target.value as "FREE" | "PREMIUM")}
                      className="h-4 w-4"
                    />
                    <span>Premium</span>
                  </label>
                </div>
              </div>

              {/* Ticket Price (only for Premium) */}
              {ticketType === "PREMIUM" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Ticket Price (৳)</Label>
                    <Input
                      id="ticketPrice"
                      name="ticketPrice"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required={ticketType === "PREMIUM"}
                    />
                  </div>
                  
                  {/* Bkash Number (required for premium) */}
                  <div className="space-y-2">
                    <Label htmlFor="bkashNumber">Bkash Number (for receiving payments)</Label>
                    <Input
                      id="bkashNumber"
                      name="bkashNumber"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      pattern="^01[0-9]{9}$"
                      required={ticketType === "PREMIUM"}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the Bkash number where you want to receive ticket payments
                    </p>
                  </div>
                </>
              )}

              {/* Ticket Limit */}
              <div className="space-y-2">
                <Label>Available Tickets</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasTicketLimitRadio"
                      checked={!hasTicketLimit}
                      onChange={() => setHasTicketLimit(false)}
                      className="h-4 w-4"
                    />
                    <span>Unlimited</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasTicketLimitRadio"
                      checked={hasTicketLimit}
                      onChange={() => setHasTicketLimit(true)}
                      className="h-4 w-4"
                    />
                    <span>Limited</span>
                  </label>
                </div>
                <input type="hidden" name="hasTicketLimit" value={hasTicketLimit.toString()} />
              </div>

              {/* Total Tickets (only if Limited) */}
              {hasTicketLimit && (
                <div className="space-y-2">
                  <Label htmlFor="totalTickets">Number of Available Tickets</Label>
                  <Input
                    id="totalTickets"
                    name="totalTickets"
                    type="number"
                    placeholder="100"
                    min="1"
                    required={hasTicketLimit}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="bg-[#ff7c07] hover:bg-[#e66f06] w-full text-white"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Event...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
