"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  Loader2,
  Mail,
  MailCheck,
  Search,
  Ticket,
  Users,
  DollarSign,
  ScanLine,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import Link from "next/link"

interface Attendee {
  userId: string
  userName: string
  userEmail: string
  totalTickets: number
  scannedTickets: number
  activeTickets: number
  expiredTickets: number
  totalSpent: number
  emailsSent: number
  firstPurchase: string
  tickets: Array<{
    ticketId: string
    status: string
    price: number
    scannedAt?: string
    emailSent: boolean
  }>
}

interface AttendeeData {
  event: {
    _id: string
    title: string
    date: string
    time: string
    location: string
  }
  stats: {
    totalTickets: number
    scannedTickets: number
    totalRevenue: number
    emailsSent: number
    scanRate: number
    averageTicketsPerAttendee: number
  }
  attendees: Attendee[]
}

export default function AttendeeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: eventId } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [data, setData] = useState<AttendeeData | null>(null)
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchAttendees()
    }
  }, [status, eventId, router])

  useEffect(() => {
    if (!data) return

    if (searchQuery.trim() === "") {
      setFilteredAttendees(data.attendees)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = data.attendees.filter(
        (attendee) =>
          attendee.userName.toLowerCase().includes(query) ||
          attendee.userEmail.toLowerCase().includes(query)
      )
      setFilteredAttendees(filtered)
    }
  }, [searchQuery, data])

  const fetchAttendees = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/organizers/events/${eventId}/attendees`)
      const result = await response.json()

      if (response.ok && result.success) {
        setData(result.data)
        setFilteredAttendees(result.data.attendees)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load attendees",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching attendees:", error)
      toast({
        title: "Error",
        description: "Failed to load attendees",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!data) return

    const headers = [
      "Name",
      "Email",
      "Total Tickets",
      "Scanned",
      "Active",
      "Expired",
      "Total Spent",
      "Emails Sent",
      "First Purchase",
    ]

    const rows = filteredAttendees.map((attendee) => [
      attendee.userName,
      attendee.userEmail,
      attendee.totalTickets,
      attendee.scannedTickets,
      attendee.activeTickets,
      attendee.expiredTickets,
      `৳${attendee.totalSpent.toFixed(2)}`,
      `${attendee.emailsSent}/${attendee.totalTickets}`,
      new Date(attendee.firstPurchase).toLocaleDateString(),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `attendees-${data.event.title.replace(/\s+/g, "-")}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Attendee data exported successfully",
    })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-8">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/organizer/attendees"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{data.event.title}</h1>
            <p className="text-muted-foreground">
              {new Date(data.event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              at {data.event.time}
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="self-start md:self-auto">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              Tickets Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {data.stats.averageTicketsPerAttendee.toFixed(1)} per attendee
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{data.stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {data.attendees.length} attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-muted-foreground" />
              Scanned Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.scannedTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.stats.scanRate.toFixed(1)}% scan rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MailCheck className="h-4 w-4 text-muted-foreground" />
              Emails Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.emailsSent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.stats.totalTickets > 0
                ? ((data.stats.emailsSent / data.stats.totalTickets) * 100).toFixed(1)
                : 0}
              % delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendees ({filteredAttendees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttendees.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Tickets</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Email Sent</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendees.map((attendee) => (
                    <TableRow key={attendee.userId}>
                      <TableCell className="font-medium">{attendee.userName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {attendee.userEmail}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{attendee.totalTickets}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {attendee.scannedTickets > 0 && (
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                              {attendee.scannedTickets} Scanned
                            </Badge>
                          )}
                          {attendee.activeTickets > 0 && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                              {attendee.activeTickets} Active
                            </Badge>
                          )}
                          {attendee.expiredTickets > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {attendee.expiredTickets} Expired
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {attendee.emailsSent === attendee.totalTickets ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <MailCheck className="mr-1 h-3 w-3" />
                            All Sent
                          </Badge>
                        ) : attendee.emailsSent > 0 ? (
                          <Badge variant="outline">
                            <Mail className="mr-1 h-3 w-3" />
                            {attendee.emailsSent}/{attendee.totalTickets}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Mail className="mr-1 h-3 w-3" />
                            None
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ৳{attendee.totalSpent.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No attendees found matching your search" : "No attendees yet"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
