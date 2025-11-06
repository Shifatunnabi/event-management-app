"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, Phone, MapPin, Eye, Loader2, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface VendorApplication {
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
  appliedAt: string
  approvalStatus: string
}

export default function VendorApplicationsPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<VendorApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionVendorId, setActionVendorId] = useState<string | null>(null)

  useEffect(() => { fetchApplications() }, [])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/vendors/applications?status=PENDING")
      const data = await response.json()
      if (data.success) { setApplications(data.applications) }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load applications", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (application: VendorApplication) => {
    setSelectedApplication(application)
    setDetailsModalOpen(true)
  }

  const handleApprove = async () => {
    if (!actionVendorId) return
    try {
      setActionLoading(true)
      const response = await fetch("/api/admin/vendors/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: actionVendorId }),
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: "Vendor approved successfully" })
        fetchApplications()
        setDetailsModalOpen(false)
      } else { throw new Error(data.error) }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to approve vendor", variant: "destructive" })
    } finally {
      setActionLoading(false)
      setApproveDialogOpen(false)
      setActionVendorId(null)
    }
  }

  const handleReject = async () => {
    if (!actionVendorId) return
    try {
      setActionLoading(true)
      const response = await fetch("/api/admin/vendors/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: actionVendorId }),
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: "Vendor application rejected" })
        fetchApplications()
        setDetailsModalOpen(false)
      } else { throw new Error(data.error) }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to reject vendor", variant: "destructive" })
    } finally {
      setActionLoading(false)
      setRejectDialogOpen(false)
      setActionVendorId(null)
    }
  }

  const openApproveDialog = (vendorId: string) => { setActionVendorId(vendorId); setApproveDialogOpen(true) }
  const openRejectDialog = (vendorId: string) => { setActionVendorId(vendorId); setRejectDialogOpen(true) }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (<div className="space-y-6"><div><h2 className="text-3xl font-bold tracking-tight">Vendor Applications</h2><p className="text-muted-foreground mt-2">Review and manage vendor application requests</p></div><div className="grid gap-4 md:grid-cols-2"><Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Applications</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{applications.length}</div></CardContent></Card></div><div className="space-y-4">{applications.length === 0 ? <Card><CardContent className="flex flex-col items-center justify-center py-10"><p className="text-muted-foreground">No pending applications</p></CardContent></Card> : applications.map((application) => <Card key={application._id}><CardContent className="pt-6"><div className="flex flex-col md:flex-row md:items-start justify-between gap-4"><div className="flex-1 space-y-3"><div><div className="flex items-center gap-3 mb-2"><h3 className="text-xl font-semibold">{application.name}</h3><Badge variant="secondary">{application.category}</Badge></div><p className="text-base font-medium text-muted-foreground mb-2">{application.serviceName}</p><div className="grid gap-2 text-sm text-muted-foreground"><div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{application.email}</span></div><div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{application.phone}</span></div><div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{application.location}</span></div></div></div><p className="text-xs text-muted-foreground">Applied on {new Date(application.appliedAt).toLocaleDateString()}</p></div><div className="flex flex-col gap-2 md:min-w-[120px]"><Button onClick={() => handleViewDetails(application)} variant="outline" className="w-full" size="sm"><Eye className="w-4 h-4 mr-2" />Details</Button><Button onClick={() => openApproveDialog(application._id)} className="w-full" size="sm" disabled={actionLoading}><CheckCircle className="w-4 h-4 mr-2" />Approve</Button><Button onClick={() => openRejectDialog(application._id)} variant="destructive" className="w-full" size="sm" disabled={actionLoading}><XCircle className="w-4 h-4 mr-2" />Reject</Button></div></div></CardContent></Card>)}</div><Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}><DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Vendor Application Details</DialogTitle></DialogHeader>{selectedApplication && <div className="space-y-6">{selectedApplication.photo && <div className="flex justify-center"><div className="relative w-32 h-32 rounded-full overflow-hidden"><Image src={selectedApplication.photo} alt={selectedApplication.name} fill className="object-cover" /></div></div>}<div><h3 className="font-semibold text-lg mb-3">Personal Information</h3><div className="grid gap-3"><div><p className="text-sm text-muted-foreground">Full Name</p><p className="font-medium">{selectedApplication.name}</p></div><div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{selectedApplication.email}</p></div><div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{selectedApplication.phone}</p></div><div><p className="text-sm text-muted-foreground">Location</p><p className="font-medium">{selectedApplication.location}</p></div></div></div><div><h3 className="font-semibold text-lg mb-3">Business Information</h3><div className="grid gap-3"><div><p className="text-sm text-muted-foreground">Service/Business Name</p><p className="font-medium">{selectedApplication.serviceName}</p></div><div><p className="text-sm text-muted-foreground">Category</p><Badge variant="secondary">{selectedApplication.category}</Badge></div>{selectedApplication.organizationName && <div><p className="text-sm text-muted-foreground">Organization Name</p><p className="font-medium">{selectedApplication.organizationName}</p></div>}<div><p className="text-sm text-muted-foreground">Price Range</p><p className="font-medium">{selectedApplication.priceRange}</p></div><div><p className="text-sm text-muted-foreground">Services Offered</p><div className="flex flex-wrap gap-2 mt-1">{selectedApplication.services.map((service, index) => <Badge key={index} variant="outline">{service}</Badge>)}</div></div></div></div><div><h3 className="font-semibold text-lg mb-3">Description</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedApplication.description}</p></div>{selectedApplication.workLinks.length > 0 && <div><h3 className="font-semibold text-lg mb-3">Work Links</h3><div className="space-y-2">{selectedApplication.workLinks.map((link, index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><ExternalLink className="w-4 h-4" />{link.label}</a>)}</div></div>}{selectedApplication.portfolioImages.length > 0 && <div><h3 className="font-semibold text-lg mb-3">Portfolio</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{selectedApplication.portfolioImages.map((image, index) => <div key={index} className="relative aspect-square rounded-lg overflow-hidden"><Image src={image} alt={`Portfolio ${index + 1}`} fill className="object-cover" /></div>)}</div></div>}<div className="flex gap-3 pt-4 border-t"><Button onClick={() => openApproveDialog(selectedApplication._id)} className="flex-1" disabled={actionLoading}>{actionLoading && actionVendorId === selectedApplication._id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}Approve</Button><Button onClick={() => openRejectDialog(selectedApplication._id)} variant="destructive" className="flex-1" disabled={actionLoading}>{actionLoading && actionVendorId === selectedApplication._id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}Reject</Button></div></div>}</DialogContent></Dialog><AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Approve Vendor Application</AlertDialogTitle><AlertDialogDescription>Are you sure you want to approve this vendor? They will be added to the vendor directory.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleApprove} disabled={actionLoading}>{actionLoading ? <>< Loader2 className="w-4 h-4 mr-2 animate-spin" />Approving...</> : "Approve"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reject Vendor Application</AlertDialogTitle><AlertDialogDescription>Are you sure you want to reject this application? This action cannot be undone and the application will be permanently deleted.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleReject} disabled={actionLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{actionLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rejecting...</> : "Reject"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>)
}
