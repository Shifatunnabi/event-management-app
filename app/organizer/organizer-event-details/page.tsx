"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Loader2, Calendar, MapPin, Clock, Users, DollarSign, Ticket, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Event {
  _id: string
  title: string
  date: string
  time: string
  location: string
  ticketType: string
  ticketPrice?: number
  ticketsSold: number
  totalTickets?: number
}

interface Attendee {
  _id: string
  ticketId: string
  name: string
  email: string
  purchaseDate: string
  status: "VALID" | "EXPIRED" | "SCANNED"
}

export default function OrganizerEventDetailsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = searchParams?.get("eventId")

  const [event, setEvent] = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAttendees(attendees)
    } else {
      const filtered = attendees.filter(
        (attendee) =>
          attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attendee.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredAttendees(filtered)
    }
  }, [searchQuery, attendees])

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/events/${eventId}`)
      const data = await response.json()

      if (data.success) {
        setEvent(data.event)
        // TODO: Fetch actual attendees when ticket system is implemented
        // For now, we'll show a placeholder
        setAttendees([])
        setFilteredAttendees([])
      }
    } catch (error) {
      console.error("Error fetching event details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!eventId) {
    return (
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <p className="text-center text-muted-foreground">Event not found</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <p className="text-center text-muted-foreground">Event not found</p>
      </div>
    )
  }

  const totalAttendees = event.ticketsSold
  const totalRevenue = event.ticketType === "PREMIUM" && event.ticketPrice
    ? event.ticketsSold * event.ticketPrice
    : 0

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      {/* Event Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl md:text-4xl font-bold">{event.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.ticketsSold}</div>
            {event.totalTickets && (
              <p className="text-xs text-muted-foreground">
                of {event.totalTickets} total
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event.ticketType === "FREE" ? "N/A" : `৳${totalRevenue.toLocaleString()}`}
            </div>
            {event.ticketType === "PREMIUM" && (
              <p className="text-xs text-muted-foreground">
                ৳{event.ticketPrice} per ticket
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendees}</div>
            <p className="text-xs text-muted-foreground">
              Registered attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Type</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.ticketType}</div>
            <p className="text-xs text-muted-foreground">
              {event.totalTickets ? "Limited" : "Unlimited"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendees Section */}
      <Card>
        <CardHeader>
          <CardTitle>Attendee List</CardTitle>
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ticket ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttendees.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendees.map((attendee) => (
                    <TableRow key={attendee._id}>
                      <TableCell className="font-mono text-sm">{attendee.ticketId}</TableCell>
                      <TableCell>{attendee.name}</TableCell>
                      <TableCell>{attendee.email}</TableCell>
                      <TableCell>
                        {new Date(attendee.purchaseDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            attendee.status === "VALID"
                              ? "default"
                              : attendee.status === "SCANNED"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {attendee.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground mb-2">
                {searchQuery ? "No attendees found" : "No attendees yet"}
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchQuery
                  ? "Try adjusting your search"
                  : "When users register for your event, they will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
