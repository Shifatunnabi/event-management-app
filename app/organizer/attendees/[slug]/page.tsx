"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Mail, Send, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Booking {
  _id: string
  userName: string
  userEmail: string
  userPhone: string
  numberOfTickets: number
  totalAmount: number
  senderBkashNumber?: string
  transactionId?: string
  status: "PENDING" | "CONFIRMED" | "REJECTED"
  ticketsSent: boolean
  tickets: any[]
  createdAt: string
}

interface Stats {
  totalSold: number
  totalPending: number
  totalRevenue: number
  ticketPrice: number
}

interface AttendeeData {
  bookings: Booking[]
  stats: Stats
  eventTitle: string
}

export default function EventAttendeesPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [data, setData] = useState<AttendeeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sendingTicketId, setSendingTicketId] = useState<string | null>(null)
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    fetchAttendees()
  }, [resolvedParams.slug])

  const fetchAttendees = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/organizers/attendees/${resolvedParams.slug}`)
      const result = await response.json()

      if (response.ok) {
        setData(result)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load attendees",
          variant: "destructive",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error("Error fetching attendees:", error)
      toast({
        title: "Error",
        description: "Failed to load attendees",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTicket = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowConfirmDialog(true)
  }

  const confirmSendTicket = async () => {
    if (!selectedBooking) return

    try {
      setSendingTicketId(selectedBooking._id)
      setShowConfirmDialog(false)

      const response = await fetch(`/api/organizers/bookings/${selectedBooking._id}/send-ticket`, {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Tickets confirmed! Email with tickets will be sent shortly.",
          duration: 2000,
        })
        fetchAttendees() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send tickets",
          variant: "destructive",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error("Error sending ticket:", error)
      toast({
        title: "Error",
        description: "Failed to send tickets",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setSendingTicketId(null)
      setSelectedBooking(null)
    }
  }

  const handleResendEmail = async (bookingId: string) => {
    try {
      setResendingEmailId(bookingId)

      const response = await fetch(`/api/organizers/bookings/${bookingId}/resend-email`, {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Email sent successfully",
          duration: 2000,
        })
        fetchAttendees() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resend email",
          variant: "destructive",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error("Error resending email:", error)
      toast({
        title: "Error",
        description: "Failed to resend email",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setResendingEmailId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-muted-foreground">Event not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/organizer/attendees")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <h1 className="mb-2 text-2xl md:text-4xl font-bold">{data.eventTitle}</h1>
        <p className="text-muted-foreground">Manage attendees and ticket confirmations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalSold}</div>
            <p className="text-xs text-muted-foreground">Confirmed tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{data.stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From confirmed sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.ticketPrice === 0 ? "FREE" : `৳${data.stats.ticketPrice.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">Per ticket</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendee List</CardTitle>
        </CardHeader>
        <CardContent>
          {data.bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-semibold text-muted-foreground mb-2">No attendees yet</p>
              <p className="text-sm text-muted-foreground">
                Attendees will appear here once they purchase tickets
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Tickets</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Bkash Number</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Email Sent</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.userName}</TableCell>
                      <TableCell>{booking.userPhone || "N/A"}</TableCell>
                      <TableCell>{booking.userEmail}</TableCell>
                      <TableCell className="text-center">{booking.numberOfTickets}</TableCell>
                      <TableCell className="text-right">
                        {booking.totalAmount === 0 ? "FREE" : `৳${booking.totalAmount.toFixed(2)}`}
                      </TableCell>
                      <TableCell>{booking.senderBkashNumber || "N/A"}</TableCell>
                      <TableCell className="font-mono text-xs">{booking.transactionId || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-center">
                        {booking.ticketsSent ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {booking.status === "PENDING" ? (
                            <Button
                              size="sm"
                              onClick={() => handleSendTicket(booking)}
                              disabled={sendingTicketId === booking._id}
                            >
                              {sendingTicketId === booking._id ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="h-3 w-3 mr-1" />
                                  Send Ticket
                                </>
                              )}
                            </Button>
                          ) : booking.status === "CONFIRMED" && !booking.ticketsSent ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendEmail(booking._id)}
                              disabled={resendingEmailId === booking._id}
                            >
                              {resendingEmailId === booking._id ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Resend Email
                                </>
                              )}
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment & Send Tickets</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm this payment and send tickets to{" "}
              <strong>{selectedBooking?.userName}</strong>?
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bkash Number:</span>
                  <span className="font-medium">{selectedBooking?.senderBkashNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono font-medium">{selectedBooking?.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">৳{selectedBooking?.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tickets:</span>
                  <span className="font-medium">{selectedBooking?.numberOfTickets}</span>
                </div>
              </div>
              <p className="mt-4 text-destructive">
                This will generate tickets, send them via email, and mark the booking as confirmed.
                Make sure you've verified the payment in your Bkash account.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendTicket}>
              Confirm & Send Tickets
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
