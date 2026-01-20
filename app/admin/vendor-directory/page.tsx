"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Trash2, Loader2, Mail, Phone, MapPin, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

export default function VendorDirectoryPage() {
  const { toast } = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetchVendors()
    fetchPendingCount()
  }, [])

  useEffect(() => {
    // Filter vendors based on search query
    if (searchQuery) {
      const filtered = vendors.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredVendors(filtered)
    } else {
      setFilteredVendors(vendors)
    }
  }, [searchQuery, vendors])

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

  const fetchPendingCount = async () => {
    try {
      const response = await fetch("/api/admin/vendors/applications?status=PENDING")
      const data = await response.json()
      if (data.success) {
        setPendingCount(data.applications.length)
      }
    } catch (error) {
      console.error("Error fetching pending count:", error)
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

  const handleDelete = async () => {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vendor Directory</h2>
        <p className="text-muted-foreground mt-2">Manage approved vendors</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, service, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVendors.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {searchQuery ? "No vendors found matching your search" : "No approved vendors yet"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {vendor.photo && (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image src={vendor.photo} alt={vendor.name} fill className="object-cover" />
                          </div>
                        )}
                        <span>{vendor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{vendor.serviceName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{vendor.category}</Badge>
                    </TableCell>
                    <TableCell>{vendor.location}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{vendor.email}</div>
                        <div>{vendor.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(vendor)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(vendor._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              onClick={handleDelete}
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
