"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  ArrowLeft,
  Users,
  Clock,
  DollarSign,
  Ticket,
  Mail,
  Send,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react"

interface BookingData {
  _id: string
  userName: string
  userEmail: string
  userPhone: string
  numberOfTickets: number
  totalAmount: number
  senderBkashNumber?: string
  transactionId?: string
  status: string
  ticketsSent: boolean
  tickets: any[]
  createdAt: string
}

interface StatsData {
  totalSold: number
  totalPending: number
  totalRevenue: number
  ticketPrice: number
}

export default function AttendeeManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const slug = params?.slug as string

  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [stats, setStats] = useState<StatsData>({
    totalSold: 0,
    totalPending: 0,
    totalRevenue: 0,
    ticketPrice: 0,
  })
  const [eventTitle, setEventTitle] = useState("")
  const [sendingTicket, setSendingTicket] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchAttendees()
    }
  }, [slug])

  const fetchAttendees = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/organizers/attendees/${slug}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load attendees")
      }

      setBookings(data.bookings)
      setStats(data.stats)
      setEventTitle(data.eventTitle)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTicket = async (bookingId: string) => {
    setSendingTicket(bookingId)
    try {
      const response = await fetch(`/api/organizers/bookings/${bookingId}/send-ticket`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send ticket")
      }

      toast({
        title: "Success",
        description: "Tickets sent successfully",
      })

      // Refresh the list
      fetchAttendees()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSendingTicket(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "secondary", label: "Pending" },
      CONFIRMED: { variant: "default", label: "Confirmed" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      EXPIRED: { variant: "outline", label: "Expired" },
    }

    const config = statusConfig[status] || { variant: "outline" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{eventTitle}</h1>
        <p className="text-muted-foreground">Manage attendees and ticket sales</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSold}</div>
            <p className="text-xs text-muted-foreground">
              Confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From confirmed sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Price</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.ticketPrice === 0 ? "FREE" : `৳${stats.ticketPrice.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Per ticket
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendees ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Total Tickets</TableHead>
                    <TableHead className="text-center">Tickets (PDF)</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bkash Number</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Email Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.userName}</TableCell>
                      <TableCell>{booking.userPhone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{booking.userEmail}</TableCell>
                      <TableCell className="text-center">{booking.numberOfTickets}</TableCell>
                      <TableCell className="text-center">
                        {booking.tickets.length > 0 ? (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.totalAmount === 0 ? (
                          <span className="text-green-600 font-semibold">FREE</span>
                        ) : (
                          `৳${booking.totalAmount.toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.senderBkashNumber || <span className="text-muted-foreground">N/A</span>}
                      </TableCell>
                      <TableCell>
                        {booking.transactionId || <span className="text-muted-foreground">N/A</span>}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-center">
                        {booking.ticketsSent ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground inline" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => handleSendTicket(booking._id)}
                            disabled={sendingTicket === booking._id}
                          >
                            {sendingTicket === booking._id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Ticket
                              </>
                            )}
                          </Button>
                        )}
                        {booking.status === "CONFIRMED" && !booking.ticketsSent && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendTicket(booking._id)}
                            disabled={sendingTicket === booking._id}
                          >
                            {sendingTicket === booking._id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resending...
                              </>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Resend
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground mb-2">No attendees yet</p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                When people book tickets for this event, they will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
