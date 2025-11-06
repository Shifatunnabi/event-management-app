"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Mail, Phone, Calendar, Search, Eye, Building, FileText, Users } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Organizer {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  organizationName?: string
  nidNumber?: string
  createdAt: string
  organizerStatus: string
}

interface Stats {
  totalOrganizers: number
  pendingCount: number
}

export default function OrganizerApprovalPage() {
  const [pendingRequests, setPendingRequests] = useState<Organizer[]>([])
  const [stats, setStats] = useState<Stats>({ totalOrganizers: 0, pendingCount: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchOrganizers()
  }, [])

  const fetchOrganizers = async () => {
    try {
      const response = await fetch("/api/admin/organizers")
      if (!response.ok) throw new Error("Failed to fetch organizers")
      
      const data = await response.json()
      setPendingRequests(data.pending)
      setStats(data.stats)
    } catch (error: any) {
      toast.error(error.message || "Failed to load organizers")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (organizerId: string) => {
    try {
      const response = await fetch("/api/admin/organizers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to approve organizer")
      }

      toast.success("Organizer approved successfully!")
      fetchOrganizers() // Refresh the list
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDecline = async (organizerId: string) => {
    try {
      const response = await fetch("/api/admin/organizers/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to decline organizer")
      }

      toast.success("Organizer request declined")
      fetchOrganizers() // Refresh the list
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const showDetails = (organizer: Organizer) => {
    setSelectedOrganizer(organizer)
    setDetailsOpen(true)
  }

  const filteredRequests = pendingRequests.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading organizers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Organizer Approval</h1>
        <p className="text-center text-muted-foreground">Review and approve organizer requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Organizers</p>
                <p className="text-3xl font-bold">{stats.totalOrganizers}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
                <p className="text-3xl font-bold">{stats.pendingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Requests</span>
            <Badge variant="secondary">{filteredRequests.length} pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? "No matching requests found" : "No pending requests"}
              </p>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request._id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-lg font-semibold">{request.name}</h3>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {request.organizationName || "N/A"}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {request.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {request.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => showDetails(request)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          onClick={() => handleApprove(request._id)}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDecline(request._id)}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Organizer Details</DialogTitle>
            <DialogDescription>Complete information submitted by the organizer</DialogDescription>
          </DialogHeader>
          {selectedOrganizer && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-base font-semibold">{selectedOrganizer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedOrganizer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base">{selectedOrganizer.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organization Name</p>
                  <p className="text-base">{selectedOrganizer.organizationName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NID Number</p>
                  <p className="text-base">{selectedOrganizer.nidNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Application Date</p>
                  <p className="text-base">{new Date(selectedOrganizer.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-base">{selectedOrganizer.address}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
