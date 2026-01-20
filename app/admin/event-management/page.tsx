"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Loader2, Calendar, Eye, MapPin, Users, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Event {
  _id: string
  title: string
  slug: string
  date: string
  time?: string
  startTime?: string
  endTime?: string
  ticketType: "FREE" | "PREMIUM"
  organizerName: string
  organizationName?: string
  status: string
  category: string
  location: string
  attendees: number
}

export default function AdminEventManagementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if there's an organizerName in the URL params
    const organizerNameParam = searchParams.get("organizerName")
    
    if (organizerNameParam) {
      // If organizerName is provided, set it as search query and fetch with filter
      setSearchQuery(organizerNameParam)
      fetchEvents(organizerNameParam)
    } else {
      // Otherwise, fetch all events
      fetchEvents()
    }
  }, [searchParams])

  useEffect(() => {
    // Manual search by user
    if (!searchParams.get("organizerName")) {
      if (searchQuery.trim() === "") {
        setFilteredEvents(events)
      } else {
        const filtered = events.filter(
          (event) =>
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.organizationName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredEvents(filtered)
      }
    }
  }, [searchQuery, events, searchParams])

  const fetchEvents = async (organizerName?: string) => {
    try {
      setIsLoading(true)
      
      // Build URL with query params
      const url = organizerName 
        ? `/api/admin/events?organizerName=${encodeURIComponent(organizerName)}`
        : "/api/admin/events"
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setEvents(data.events)
        setFilteredEvents(data.events)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (eventId: string) => {
    router.push(`/organizer/organizer-event-details?eventId=${eventId}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    // Clear the organizerName param when user manually searches
    if (searchParams.get("organizerName")) {
      router.replace("/admin/event-management")
    }
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl md:text-4xl font-bold">Event Management</h1>
        <p className="text-muted-foreground">
          View and manage all events from all organizers
          {searchParams.get("organizerName") && (
            <span className="ml-2 font-semibold text-primary">
              (Showing events by: {searchParams.get("organizerName")})
            </span>
          )}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by event name, organizer name, or organization name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="shrink-0 bg-[#ff7c07] border-2 border-black rounded-lg p-3 text-center w-16">
                        <div className="text-xl font-bold leading-none text-white">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="text-xs font-bold uppercase mt-1 text-white">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <Badge
                                variant={event.ticketType === "FREE" ? "secondary" : "default"}
                                className={
                                  event.ticketType === "FREE"
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                }
                              >
                                {event.ticketType}
                              </Badge>
                              {event.status === "HIDDEN" && (
                                <Badge className="bg-gray-200 text-gray-700">
                                  Hidden
                                </Badge>
                              )}
                            </div>
                            
                            {/* Date, Time, Location, Attendees */}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(event.date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {(event.startTime || event.endTime)
                                    ? `${event.startTime || ''} - ${event.endTime || ''}`.trim().replace(/^-\s*/, '').replace(/\s*-$/, '')
                                    : event.time || "Time TBA"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate max-w-[200px]">{event.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{event.attendees} attendees</span>
                              </div>
                            </div>
                            
                            {/* Organizer Info */}
                            <p className="text-sm font-medium text-muted-foreground mt-2">
                              <span className="text-foreground">{event.organizerName}</span>
                              {event.organizationName && (
                                <span className="ml-1">• {event.organizationName}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-[#ff7c07] hover:bg-[#e66f06]"
                      onClick={() => handleViewDetails(event._id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-muted-foreground mb-2">
            {searchQuery ? "No events found" : "No events yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "Events from organizers will appear here"}
          </p>
        </div>
      )}
    </div>
  )
}
