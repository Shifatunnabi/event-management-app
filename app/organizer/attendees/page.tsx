"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, Calendar, MapPin, Users, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface Event {
  _id: string
  title: string
  slug: string
  date: string
  time?: string
  startTime?: string
  endTime?: string
  location: string
  interested: string[]
  going: string[]
}

export default function AttendeeManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEvents(events)
    } else {
      const filtered = events.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredEvents(filtered)
    }
  }, [searchQuery, events])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/organizers/events")
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
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventClick = (slug: string) => {
    router.push(`/organizer/attendees/${slug}`)
  }

  const handleEdit = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/organizer/edit-event/${eventId}`)
  }

  const handleDeleteClick = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteEventId(eventId)
  }

  const handleDelete = async () => {
    if (!deleteEventId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/organizers/events/${deleteEventId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        })
        fetchEvents()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteEventId(null)
    }
  }

  const getTotalAttendees = (event: Event) => {
    return (event.interested?.length || 0) + (event.going?.length || 0)
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl md:text-4xl font-bold">Attendee Management</h1>
        <p className="text-muted-foreground">Select an event to view attendee details</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <Card
              key={event._id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEventClick(event.slug)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
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
                    <h3 className="font-semibold text-lg truncate mb-1">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                      </div>
                      {(event.startTime && event.endTime) && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{getTotalAttendees(event)} attendees</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Action Buttons */}
                  <div className="hidden md:flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleEdit(event._id, e)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDeleteClick(event._id, e)}
                      className="text-red-600 hover:text-red-700 hover:border-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>

                  {/* Mobile 3-Dot Menu */}
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEdit(event._id, e as any)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteClick(event._id, e as any)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
              ? "Try adjusting your search"
              : "Create your first event to get started"}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event and all associated data including attendees and tickets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Event"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

