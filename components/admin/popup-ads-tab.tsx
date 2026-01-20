"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface PopupAd {
  _id: string
  companyName: string
  description: string
  ctaLink: string
  ctaButton: string
  posterUrl: string
  active: boolean
  uploadedAt: string
}

export default function PopupAdsTab() {
  const { toast } = useToast()
  const [ads, setAds] = useState<PopupAd[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingAdId, setEditingAdId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    ctaLink: "",
    ctaButton: "Know More",
    posterUrl: "",
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/popup-ads")
      const data = await response.json()
      if (data.success) {
        setAds(data.ads)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load popup ads",
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
    if (!formData.companyName || !formData.description || !formData.ctaLink || !formData.posterUrl) {
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

      const url = "/api/admin/popup-ads"
      const method = editingAdId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAdId ? { ...formData, adId: editingAdId } : formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingAdId ? "Ad updated successfully" : "Popup ad uploaded successfully",
          duration: 2000,
        })
        setFormData({ 
          companyName: "", 
          description: "", 
          ctaLink: "", 
          ctaButton: "Know More", 
          posterUrl: "" 
        })
        setEditingAdId(null)
        fetchAds()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save ad",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleEdit = (ad: PopupAd) => {
    setFormData({
      companyName: ad.companyName,
      description: ad.description,
      ctaLink: ad.ctaLink,
      ctaButton: ad.ctaButton,
      posterUrl: ad.posterUrl,
    })
    setEditingAdId(ad._id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    setFormData({ 
      companyName: "", 
      description: "", 
      ctaLink: "", 
      ctaButton: "Know More", 
      posterUrl: "" 
    })
    setEditingAdId(null)
  }

  const handleToggleActive = async (adId: string, currentActive: boolean) => {
    try {
      const response = await fetch("/api/admin/popup-ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, active: !currentActive }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Ad ${!currentActive ? "activated" : "deactivated"} successfully`,
          duration: 2000,
        })
        fetchAds()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update ad",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteAdId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/popup-ads?adId=${deleteAdId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Ad deleted successfully",
          duration: 2000,
        })
        fetchAds()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ad",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsDeleting(false)
      setDeleteAdId(null)
    }
  }

  const removePosterPreview = () => {
    setFormData({ ...formData, posterUrl: "" })
  }

  return (
    <>
      {/* Upload New Ad */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{editingAdId ? "Edit Pop-up Ad" : "Upload New Pop-up Ad"}</CardTitle>
            {editingAdId && (
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company-name"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter advertisement description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta-link">
                CTA Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cta-link"
                placeholder="https://example.com"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Enter the URL where users will be redirected
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta-button">
                CTA Button Text
              </Label>
              <Input
                id="cta-button"
                placeholder="Know More"
                value={formData.ctaButton}
                onChange={(e) => setFormData({ ...formData, ctaButton: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poster-file">
                Ad Poster <span className="text-red-500">*</span>
              </Label>
              {formData.posterUrl ? (
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border-2 border-green-500 max-w-md">
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
                          Recommended size: 800x600px (4:3 ratio)
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
                  {editingAdId ? "Updating..." : "Uploading..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {editingAdId ? "Update Ad" : "Upload Ad"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Ads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Pop-up Ads</span>
            <Badge variant="secondary">{ads.filter((a) => a.active).length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No popup ads uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.map((ad) => (
                <Card key={ad._id} className="border-2">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={ad.posterUrl || "/placeholder.svg"}
                          alt={ad.companyName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{ad.companyName}</h3>
                          <Badge variant={ad.active ? "default" : "secondary"}>
                            {ad.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ad.description}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Link: {ad.ctaLink}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(ad.uploadedAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(ad)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => handleToggleActive(ad._id, ad.active)}
                          >
                            {ad.active ? (
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
                            onClick={() => setDeleteAdId(ad._id)}
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
      <AlertDialog open={!!deleteAdId} onOpenChange={() => setDeleteAdId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ad.
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
    </>
  )
}
