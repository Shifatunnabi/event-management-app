"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, Loader2, Ticket as TicketIcon, Plus, User as UserIcon, Mail, Phone, MapPin as LocationIcon, Save, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import TicketDisplay from "@/components/tickets/TicketDisplay"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, QrCode } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface TicketGroup {
  event: {
    id: string
    slug: string
    title: string
    date: string
    time: string
    location: string
    locationLink?: string
    organizerName: string
    image: string
    ticketPrice: number
  }
  tickets: Array<{
    id: string
    qrData: string
    qrSignature: string
    status: "ACTIVE" | "SCANNED" | "EXPIRED"
    price: number
    purchaseDate: string
    scannedAt?: string
    emailSent: boolean
  }>
  totalTickets: number
  totalAmount: number
  scannedCount: number
  activeCount: number
  expiredCount: number
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  profileImage?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [ticketGroups, setTicketGroups] = useState<TicketGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<TicketGroup | null>(null)
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      const currentPath = window.location.pathname
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    if (status === "authenticated") {
      fetchUserProfile()
      fetchUserTickets()
    }
  }, [status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()

      if (response.ok && data.success) {
        setProfile(data.user)
        setProfileForm({
          name: data.user.name,
          phone: data.user.phone || "",
          address: data.user.address || "",
        })
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    }
  }

  const fetchUserTickets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/tickets/user")
      const data = await response.json()

      if (response.ok && data.success) {
        setTicketGroups(data.ticketGroups || [])
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("File selected:", file.name, file.type, file.size)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploadingImage(true)
      console.log("Starting upload...")
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/user/upload-image", {
        method: "POST",
        body: formData,
      })

      console.log("Upload response status:", response.status)
      const data = await response.json()
      console.log("Upload response data:", data)

      if (response.ok && data.success) {
        // Update profile with new image
        const updateResponse = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...profileForm,
            profileImage: data.imageUrl,
          }),
        })

        const updateData = await updateResponse.json()

        if (updateResponse.ok && updateData.success) {
          setProfile(updateData.user)
          toast({
            title: "Success",
            description: "Profile photo updated successfully",
          })
        }
      } else {
        throw new Error(data.error || "Failed to upload image")
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!profileForm.name || !profileForm.phone) {
      toast({
        title: "Validation error",
        description: "Name and phone are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileForm,
          profileImage: profile?.profileImage,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setProfile(data.user)
        setIsEditingProfile(false)
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } else {
        throw new Error(data.error || "Failed to update profile")
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredTickets = ticketGroups.filter((group) =>
    group.event.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      year: date.getFullYear(),
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500"
      case "SCANNED":
        return "bg-blue-500"
      case "EXPIRED":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="py-8">
        

        {/* Profile Section */}
        <div className="max-w-md mx-auto mb-8 bg-white rounded-lg border p-6">
                    
          {!isEditingProfile ? (
            <div className="space-y-3">
              {/* Profile Photo */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100">
                    {profile?.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt={profile.name}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-400 to-pink-400">
                        <UserIcon className="w-14 h-14 text-white" />
                      </div>
                    )}
                  </div>
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute bottom-0 right-0 bg-[#ff7c07] hover:bg-[#e66f06] text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
               
              </div>

              {/* Profile Details - Compact */}
              <div className="text-center space-y-2">
                <p className="font-bold text-xl md:text-2xl text-gray-900">{profile?.name}</p>
                <p className="text-sm text-gray-600 break-all">{profile?.email}</p>
                <p className="text-sm text-gray-600">{profile?.phone || "No phone"}</p>
                <p className="text-sm text-gray-600">{profile?.address || "No address"}</p>
              </div>

              {/* Edit Button */}
              <Button
                onClick={() => setIsEditingProfile(true)}
                className="w-full bg-[#ff7c07] hover:bg-[#e66f06] text-white mt-4"
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile Photo (Edit Mode) */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100">
                    {profile?.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt={profile.name}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-400 to-pink-400">
                        <UserIcon className="w-14 h-14 text-white" />
                      </div>
                    )}
                  </div>
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute bottom-0 right-0 bg-[#ff7c07] hover:bg-[#e66f06] text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click button to change photo
                </p>
              </div>

              {/* Edit Form */}
              <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email (Cannot be changed)</Label>
                      <Input
                        id="email"
                        value={profile?.email}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Enter your address"
                    rows={2}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="flex-1 bg-[#ff7c07] hover:bg-[#e66f06] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingProfile(false)
                    setProfileForm({
                      name: profile?.name || "",
                      phone: profile?.phone || "",
                      address: profile?.address || "",
                    })
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tickets Section Header */}
        <h2 className="mb-4 text-2xl font-bold">My Tickets</h2>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((group) => {
              const { day, month, year } = formatDate(group.event.date)
              return (
                <Card
                  key={group.event.id}
                  className="group overflow-hidden border-b-2 border-b-black/50 bg-gray-300/30 p-0 transition-all hover:shadow-lg"
                >
                  {/* Event Banner */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={group.event.image}
                      alt={group.event.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {/* Ticket Count Badge */}
                    <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full flex items-center gap-2">
                      <TicketIcon className="h-4 w-4" />
                      <span className="font-semibold">{group.totalTickets}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-3 p-4">
                    {/* Event Title */}
                    <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-gray-900">
                      {group.event.title}
                    </h3>

                    {/* Date & Location */}
                    <div className="flex gap-3">
                      {/* Date Box */}
                      <div className="w-16 shrink-0 rounded-lg bg-[#ff7c07] p-3 border-2 border-black text-center text-black">
                        <div className="text-2xl font-bold leading-none">{day}</div>
                        <div className="mt-1 text-xs uppercase">{month}</div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-2 text-sm">
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                          <span className="line-clamp-1">{group.event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 shrink-0 text-green-600" />
                          <span>{group.event.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Summary */}
                    <div className="flex gap-2 text-xs">
                      {group.activeCount > 0 && (
                        <Badge className="bg-green-500">
                          {group.activeCount} Active
                        </Badge>
                      )}
                      {group.scannedCount > 0 && (
                        <Badge className="bg-blue-500">
                          {group.scannedCount} Scanned
                        </Badge>
                      )}
                      {group.expiredCount > 0 && (
                        <Badge className="bg-gray-500">
                          {group.expiredCount} Expired
                        </Badge>
                      )}
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-sm text-gray-600">Total Paid</span>
                      <span className="text-lg font-bold text-purple-600">
                        ৳{group.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => setSelectedGroup(group)}
                        className="flex-1 bg-black hover:bg-white hover:text-black"
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        View Tickets
                      </Button>
                      <Link href={`/events/${group.event.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          Event Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full py-12 text-center">
              <TicketIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-semibold text-gray-600 mb-2">
                No tickets yet
              </p>
              <p className="text-muted-foreground mb-4">
                Purchase tickets for events to see them here
              </p>
              <Link href="/">
                <Button>Browse Events</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Display Modal */}
      {selectedGroup && (
        <TicketDisplay
          isOpen={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
          tickets={selectedGroup.tickets}
          event={{
            title: selectedGroup.event.title,
            date: selectedGroup.event.date,
            time: selectedGroup.event.time,
            location: selectedGroup.event.location,
            organizerName: selectedGroup.event.organizerName,
            image: selectedGroup.event.image,
          }}
        />
      )}
    </div>
  )
}
