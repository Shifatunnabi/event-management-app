"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Phone, MapPin, Eye, Trash2, Loader2, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Vendor {
  _id: string
  name: string
  photo?: string
  serviceName: string
  category: string
  phone: string
  email: string
  location: string
  priceRange: string
  organizationName?: string
  services: string[]
  description: string
  workLinks: { label: string; url: string }[]
  portfolioImages: string[]
  approvedAt: string
}

export default function VendorManagementPage() {
  const { toast } = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchVendors()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = vendors.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredVendors(filtered)
    } else {
      setFilteredVendors(vendors)
    }
  }, [searchTerm, vendors])

  const fetchVendors = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/vendors/directory")
      const data = await response.json()

      if (data.success) {
        setVendors(data.vendors)
        setFilteredVendors(data.vendors)
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setDetailsModalOpen(true)
  }

  const openDeleteDialog = (vendorId: string) => {
    setVendorToDelete(vendorId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteVendor = async () => {
    if (!vendorToDelete) return

    try {
      setDeleteLoading(true)
      const response = await fetch("/api/admin/vendors/directory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: vendorToDelete }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Vendor removed successfully",
          duration: 2000,
        })
        fetchVendors()
        setDetailsModalOpen(false)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vendor",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setVendorToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Vendor Directory Management</h1>
        <p className="text-center text-muted-foreground">Manage all approved vendors in the directory</p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Vendors</span>
            <Badge variant="secondary">{filteredVendors.length} vendors</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVendors.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {vendors.length === 0
                ? "No approved vendors yet"
                : "No vendors found matching your search"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVendors.map((vendor) => (
                <Card key={vendor._id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold">{vendor.name}</h3>
                          <Badge variant="outline">{vendor.category}</Badge>
                        </div>
                        <p className="text-base font-medium text-muted-foreground">{vendor.serviceName}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {vendor.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {vendor.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {vendor.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleViewDetails(vendor)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog(vendor._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-6">
              {/* Photo */}
              {selectedVendor.photo && (
                <div className="flex justify-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden">
                    <Image
                      src={selectedVendor.photo}
                      alt={selectedVendor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                <div className="grid gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedVendor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedVendor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedVendor.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedVendor.location}</p>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Business Information</h3>
                <div className="grid gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Service/Business Name</p>
                    <p className="font-medium">{selectedVendor.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="secondary">{selectedVendor.category}</Badge>
                  </div>
                  {selectedVendor.organizationName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Organization Name</p>
                      <p className="font-medium">{selectedVendor.organizationName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Price Range</p>
                    <p className="font-medium">{selectedVendor.priceRange}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Services Offered</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedVendor.services.map((service, index) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedVendor.description}
                </p>
              </div>

              {/* Work Links */}
              {selectedVendor.workLinks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Work Links</h3>
                  <div className="space-y-2">
                    {selectedVendor.workLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {selectedVendor.portfolioImages.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Portfolio</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedVendor.portfolioImages.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => openDeleteDialog(selectedVendor._id)}
                  variant="destructive"
                  className="flex-1"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Remove from Directory
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this vendor from the directory? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVendor}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
