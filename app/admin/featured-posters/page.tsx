"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Trash2, Eye, EyeOff, Loader2, X, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import imageCompression from "browser-image-compression"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface FeaturedPoster {
  _id: string
  eventName: string
  eventLink: string
  posterUrl: string
  active: boolean
  uploadedAt: string
}

export default function FeaturedPostersPage() {
  const { toast } = useToast()
  const [posters, setPosters] = useState<FeaturedPoster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [deletePosterId, setDeletePosterId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingPosterId, setEditingPosterId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    eventName: "",
    eventLink: "",
    posterUrl: "",
  })

  useEffect(() => {
    fetchPosters()
  }, [])

  const fetchPosters = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/featured-posters")
      const data = await response.json()
      if (data.success) {
        setPosters(data.posters)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load posters",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingImage(true)

      // Compress image
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }

      const compressedFile = await imageCompression(file, options)

      // Upload to Cloudinary
      const uploadFormData = new FormData()
      uploadFormData.append("file", compressedFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const data = await response.json()

      if (data.url) {
        setFormData({ ...formData, posterUrl: data.url })
        toast({
          title: "Success",
          description: "Poster image uploaded successfully",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload poster image",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleUpload = async () => {
    if (!formData.eventName || !formData.eventLink || !formData.posterUrl) {
      toast({
        title: "Error",
        description: "Please fill all fields and upload a poster image",
        variant: "destructive",
        duration: 2000,
      })
      return
    }

    try {
      setIsUploading(true)

      const url = editingPosterId 
        ? "/api/admin/featured-posters"
        : "/api/admin/featured-posters"

      const method = editingPosterId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPosterId ? { ...formData, posterId: editingPosterId } : formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingPosterId ? "Poster updated successfully" : "Featured poster uploaded successfully",
          duration: 2000,
        })
        setFormData({ eventName: "", eventLink: "", posterUrl: "" })
        setEditingPosterId(null)
        fetchPosters()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save poster",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleEdit = (poster: FeaturedPoster) => {
    setFormData({
      eventName: poster.eventName,
      eventLink: poster.eventLink,
      posterUrl: poster.posterUrl,
    })
    setEditingPosterId(poster._id)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    setFormData({ eventName: "", eventLink: "", posterUrl: "" })
    setEditingPosterId(null)
  }

  const handleToggleActive = async (posterId: string, currentActive: boolean) => {
    try {
      const response = await fetch("/api/admin/featured-posters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posterId, active: !currentActive }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Poster ${!currentActive ? "activated" : "deactivated"} successfully`,
          duration: 2000,
        })
        fetchPosters()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update poster",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const handleDelete = async () => {
    if (!deletePosterId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/featured-posters?posterId=${deletePosterId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Poster deleted successfully",
          duration: 2000,
        })
        fetchPosters()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete poster",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsDeleting(false)
      setDeletePosterId(null)
    }
  }

  const removePosterPreview = () => {
    setFormData({ ...formData, posterUrl: "" })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Featured Poster Management</h1>
        <p className="text-center text-muted-foreground">Manage hero slider posters</p>
      </div>

      {/* Upload New Poster */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{editingPosterId ? "Edit Poster" : "Upload New Poster"}</CardTitle>
            {editingPosterId && (
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-name">
                Event Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="event-name"
                placeholder="Enter event name"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-link">
                Event Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="event-link"
                placeholder="/events/event-id or full URL"
                value={formData.eventLink}
                onChange={(e) => setFormData({ ...formData, eventLink: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Enter the event details page link (e.g., /events/123 or full URL)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="poster-file">
                Event Poster <span className="text-red-500">*</span>
              </Label>
              {formData.posterUrl ? (
                <div className="space-y-3">
                  <div className="relative aspect-[16/5] rounded-lg overflow-hidden bg-gray-100 border-2 border-green-500">
                    <Image
                      src={formData.posterUrl}
                      alt="Poster preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removePosterPreview}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-green-600 font-medium">✓ Poster uploaded successfully</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label
                    htmlFor="poster-file"
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:border-purple-600 transition-colors cursor-pointer block"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
                        <p className="text-sm font-medium mb-2">Uploading poster...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mb-1">PNG, JPG up to 10MB</p>
                        <p className="text-xs font-semibold text-purple-600">
                          Recommended size: 1920x600px (16:5 ratio)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This size fits perfectly in the hero slider
                        </p>
                      </>
                    )}
                  </label>
                  <Input
                    id="poster-file"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleUpload}
              className="w-full bg-linear-to-r from-purple-600 to-blue-600"
              disabled={isUploading || isUploadingImage}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingPosterId ? "Updating..." : "Uploading..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {editingPosterId ? "Update Poster" : "Upload Poster"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Posters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Posters</span>
            <Badge variant="secondary">{posters.filter((p) => p.active).length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posters.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No posters uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posters.map((poster) => (
                <Card key={poster._id} className="border-2">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="relative aspect-[16/5] rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={poster.posterUrl || "/placeholder.svg"}
                          alt={poster.eventName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{poster.eventName}</h3>
                          <Badge variant={poster.active ? "default" : "secondary"}>
                            {poster.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          Link: {poster.eventLink}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(poster.uploadedAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(poster)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => handleToggleActive(poster._id, poster.active)}
                          >
                            {poster.active ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletePosterId(poster._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePosterId} onOpenChange={() => setDeletePosterId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the poster from the hero slider.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
