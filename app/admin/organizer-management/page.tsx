"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Mail, Building, Search, Eye, Phone, FileText, Users, ShieldBan, ShieldCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Organizer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  organizationName?: string
  nidNumber?: string
  joinDate: string
  eventCount: number
  isBanned?: boolean
}

interface Stats {
  totalOrganizers: number
  pendingRequests: number
  totalEvents: number
}

export default function OrganizerManagementPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [stats, setStats] = useState<Stats>({
    totalOrganizers: 0,
    pendingRequests: 0,
    totalEvents: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchOrganizers()
  }, [])

  const fetchOrganizers = async () => {
    try {
      const response = await fetch("/api/admin/organizers/management")
      if (!response.ok) throw new Error("Failed to fetch organizers")
      
      const data = await response.json()
      setOrganizers(data.organizers)
      setStats(data.stats)
    } catch (error: any) {
      toast.error(error.message || "Failed to load organizers")
    } finally {
      setLoading(false)
    }
  }

  const showDetails = (organizer: Organizer) => {
    setSelectedOrganizer(organizer)
    setDetailsOpen(true)
  }

  const handleBanToggle = async (organizerId: string, currentBanStatus: boolean) => {
    try {
      setActionLoading(organizerId)
      const response = await fetch("/api/admin/organizers/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerId,
          isBanned: !currentBanStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchOrganizers()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update ban status")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredOrganizers = organizers.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase()),
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
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Organizer Management</h1>
        <p className="text-center text-muted-foreground">Manage all event organizers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                <p className="text-3xl font-bold">{stats.pendingRequests}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                <p className="text-3xl font-bold">{stats.totalEvents}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizers List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Organizers</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrganizers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? "No matching organizers found" : "No organizers yet"}
              </p>
            ) : (
              filteredOrganizers.map((organizer) => (
                <Card key={organizer.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{organizer.name}</h3>
                          {organizer.isBanned ? (
                            <Badge className="bg-red-600">Banned</Badge>
                          ) : (
                            <Badge className="bg-green-600">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {organizer.organizationName || "N/A"}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {organizer.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {organizer.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Joined: {new Date(organizer.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="pt-2">
                          <Badge variant="secondary">{organizer.eventCount} Events Listed</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => showDetails(organizer)}
                          className="w-full sm:w-auto"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          variant={organizer.isBanned ? "default" : "destructive"}
                          size="sm"
                          onClick={() => handleBanToggle(organizer.id, organizer.isBanned || false)}
                          disabled={actionLoading === organizer.id}
                          className="w-full sm:w-auto"
                        >
                          {actionLoading === organizer.id ? (
                            <>Loading...</>
                          ) : organizer.isBanned ? (
                            <>
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Unban
                            </>
                          ) : (
                            <>
                              <ShieldBan className="w-4 h-4 mr-2" />
                              Ban
                            </>
                          )}
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
            <DialogDescription>Complete information about the organizer</DialogDescription>
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
                  <p className="text-sm font-medium text-muted-foreground">Join Date</p>
                  <p className="text-base">{new Date(selectedOrganizer.joinDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-base font-semibold">{selectedOrganizer.eventCount}</p>
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
