"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, Plus, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import imageCompression from "browser-image-compression"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VendorRegistrationFormProps {
  onBack: () => void
}

export default function VendorRegistrationForm({ onBack }: VendorRegistrationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false)

  const [formData, setFormData] = useState({
    // Basic information
    name: "",
    email: "",
    phone: "",
    address: "",

    // Vendor specific fields
    photo: "",
    serviceName: "",
    category: "",
    location: "",
    priceRange: "",
    organizationName: "",
    services: "",
    description: "",
  })

  const [workLinks, setWorkLinks] = useState<{ label: string; url: string }[]>([{ label: "", url: "" }])
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingPhoto(true)

      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      }

      const compressedFile = await imageCompression(file, options)

      const uploadFormData = new FormData()
      uploadFormData.append("file", compressedFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const data = await response.json()

      if (data.url) {
        setFormData({ ...formData, photo: data.url })
        toast.success("Photo uploaded successfully")
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast.error("Failed to upload photo")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (portfolioImages.length + files.length > 5) {
      toast.error("You can only upload up to 5 portfolio images")
      return
    }

    try {
      setIsUploadingPortfolio(true)

      for (const file of files) {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        }

        const compressedFile = await imageCompression(file, options)

        const uploadFormData = new FormData()
        uploadFormData.append("file", compressedFile)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        const data = await response.json()

        if (data.url) {
          setPortfolioImages((prev) => [...prev, data.url])
        }
      }

      toast.success("Portfolio images uploaded successfully")
    } catch (error) {
      console.error("Error uploading portfolio:", error)
      toast.error("Failed to upload portfolio images")
    } finally {
      setIsUploadingPortfolio(false)
    }
  }

  const removePortfolioImage = (index: number) => {
    setPortfolioImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addWorkLink = () => {
    setWorkLinks([...workLinks, { label: "", url: "" }])
  }

  const removeWorkLink = (index: number) => {
    setWorkLinks(workLinks.filter((_, i) => i !== index))
  }

  const updateWorkLink = (index: number, field: "label" | "url", value: string) => {
    const newLinks = [...workLinks]
    newLinks[index][field] = value
    setWorkLinks(newLinks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.serviceName || !formData.category || !formData.location || !formData.description) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setIsSubmitting(true)

      // Parse services from comma-separated string
      const servicesArray = formData.services
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      // Filter out empty work links
      const validWorkLinks = workLinks.filter((link) => link.label && link.url)

      const response = await fetch("/api/vendors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Vendor application data
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          photo: formData.photo,
          serviceName: formData.serviceName,
          category: formData.category,
          location: formData.location,
          priceRange: formData.priceRange || "$$ - Moderate",
          organizationName: formData.organizationName,
          services: servicesArray,
          description: formData.description,
          workLinks: validWorkLinks,
          portfolioImages,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Vendor application submitted successfully! Please wait for admin approval.")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to selection
        </Button>
        <h1 className="mb-2 text-2xl font-bold md:text-4xl">Vendor Registration</h1>
        <p className="text-muted-foreground">Fill in your details to become a featured vendor</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Account Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
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
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+880 1XXX-XXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter your full address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {/* Profile Photo */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Profile Photo</h3>

              <div className="space-y-2">
                <Label htmlFor="photo">Your Photo (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploadingPhoto}
                  />
                  <Label
                    htmlFor="photo"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : formData.photo ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        Photo Uploaded
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </Label>
                  {formData.photo && (
                    <div className="relative h-16 w-16 rounded-full overflow-hidden border-2">
                      <Image src={formData.photo} alt="Your photo" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Business Information</h3>

              <div className="space-y-2">
                <Label htmlFor="serviceName">
                  Service/Business Name <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Catering">Catering</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                    <SelectItem value="Decoration">Decoration</SelectItem>
                    <SelectItem value="Audio/Visual">Audio/Visual</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name (Optional)</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  placeholder="Your organization name"
                  value={formData.organizationName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Service Location (City, Country) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Dhaka, Bangladesh"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Service Details</h3>

              <div className="space-y-2">
                <Label htmlFor="priceRange">Price Range</Label>
                <Select value={formData.priceRange} onValueChange={(value) => setFormData({ ...formData, priceRange: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$ - Budget">$ - Budget</SelectItem>
                    <SelectItem value="$$ - Moderate">$$ - Moderate</SelectItem>
                    <SelectItem value="$$$ - Premium">$$$ - Premium</SelectItem>
                    <SelectItem value="$$$$ - Luxury">$$$$ - Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="services">Services (Comma separated)</Label>
                <Input
                  id="services"
                  name="services"
                  placeholder="e.g., Wedding Photography, Portrait, Events"
                  value={formData.services}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">Separate each service with a comma</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell us about your services, experience, and what makes you unique..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Work Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Work Links (Optional)</h3>
                <Button type="button" variant="outline" size="sm" onClick={addWorkLink}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add More
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Add links to your portfolio, social media, etc.</p>

              {workLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Label (e.g., Instagram, Portfolio)"
                      value={link.label}
                      onChange={(e) => updateWorkLink(index, "label", e.target.value)}
                    />
                  </div>
                  <div className="flex-2 space-y-2">
                    <Input
                      placeholder="URL"
                      type="url"
                      value={link.url}
                      onChange={(e) => updateWorkLink(index, "url", e.target.value)}
                    />
                  </div>
                  {workLinks.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeWorkLink(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Portfolio Images */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Portfolio Images (Up to 5)</h3>
              <p className="text-sm text-muted-foreground">Upload your 5 best photos showcasing your work</p>

              <div className="space-y-4">
                {portfolioImages.length < 5 && (
                  <div>
                    <Input
                      id="portfolioUpload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePortfolioUpload}
                      className="hidden"
                      disabled={isUploadingPortfolio}
                    />
                    <Label
                      htmlFor="portfolioUpload"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-input bg-background px-6 py-8 text-sm hover:bg-accent disabled:opacity-50"
                    >
                      {isUploadingPortfolio ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          Click to upload images ({portfolioImages.length}/5)
                        </>
                      )}
                    </Label>
                  </div>
                )}

                {portfolioImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {portfolioImages.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 group">
                        <Image src={url} alt={`Portfolio ${index + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removePortfolioImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notice */}
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">Note:</p>
              <p>
                Your vendor application will be submitted for admin review. Once approved, your profile will appear in 
                the vendor directory. No user account will be created from this application.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="bg-[#ff7c07] hover:bg-[#e66f06] w-full text-white"
              size="lg"
              disabled={isSubmitting || isUploadingPhoto || isUploadingPortfolio}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                "Submit Vendor Application"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
