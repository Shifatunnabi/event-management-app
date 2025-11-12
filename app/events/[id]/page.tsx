"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Users, Share2, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import AdPlaceholder from "@/components/ui/ad-placeholder"
import ShareModal from "@/components/ui/share-modal"
import BuyTicketFlow from "@/components/tickets/BuyTicketFlow"

interface Event {
  id: string
  slug: string
  title: string
  description: string
  image: string
  date: string
  time: string
  location: string
  locationLink?: string
  category: string
  organizer: string
  organizationName?: string
  price: number | "Free"
  ticketType: "FREE" | "PREMIUM"
  hasTicketLimit: boolean
  totalTickets?: number
  ticketsSold: number
  attendees: number
  isFeatured: boolean
}

async function getEvent(slug: string): Promise<Event | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/events/${slug}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.success ? data.event : null
  } catch (error) {
    console.error("Error fetching event:", error)
    return null
  }
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    const fetchEvent = async () => {
      const eventData = await getEvent(resolvedParams.id)
      if (eventData) {
        setEvent(eventData)
        setCurrentUrl(window.location.href)
      }
    }
    fetchEvent()
  }, [resolvedParams.id])

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading event...</p>
      </div>
    )
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const isPremium = event.ticketType === "PREMIUM"
  
  // Check if event is finished (event date is in the past)
  const isEventFinished = new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0))

  // Convert Google Maps share link to embed link
  const getEmbedUrl = (locationLink?: string) => {
    if (!locationLink) return null

    try {
      // Handle various Google Maps URL formats:
      // 1. Short link: https://maps.app.goo.gl/xxxxx or https://goo.gl/maps/xxxxx
      // 2. Full link: https://www.google.com/maps/place/...
      // 3. Coordinate link: https://www.google.com/maps/@lat,lng,zoom
      // 4. Search link: https://www.google.com/maps/search/...
      
      // If it's a shortened link (goo.gl), use the simple embed format
      if (locationLink.includes('goo.gl')) {
        return `https://www.google.com/maps?q=${encodeURIComponent(locationLink)}&output=embed`
      }
      
      // If it contains /place/, extract the place name
      if (locationLink.includes('/place/')) {
        const placeMatch = locationLink.match(/\/place\/([^/@]+)/)
        if (placeMatch) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
          return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`
        }
      }
      
      // If it contains coordinates (@lat,lng)
      if (locationLink.includes('/@')) {
        const coordMatch = locationLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (coordMatch) {
          const lat = coordMatch[1]
          const lng = coordMatch[2]
          return `https://www.google.com/maps?q=${lat},${lng}&output=embed`
        }
      }
      
      // If it contains /search/, extract the search query
      if (locationLink.includes('/search/')) {
        const searchMatch = locationLink.match(/\/search\/([^/]+)/)
        if (searchMatch) {
          const searchQuery = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '))
          return `https://www.google.com/maps?q=${encodeURIComponent(searchQuery)}&output=embed`
        }
      }
      
      // Default fallback: try to embed the full URL or use it as a search query
      return `https://www.google.com/maps?q=${encodeURIComponent(locationLink)}&output=embed`
    } catch (error) {
      console.error('Error parsing map URL:', error)
      return null
    }
  }

  const embedMapUrl = getEmbedUrl(event.locationLink)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="py-8">
        <div className="relative h-[200px] w-full overflow-hidden rounded-2xl md:h-[300px] lg:h-[400px]">
          <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        </div>
      </div>

      {/* Main Content */}
      <div className="py-4">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Side - Event Info and CTA (3 columns) */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold lg:text-4xl">{event.title}</h1>
                {isEventFinished && (
                  <Badge variant="secondary" className="bg-gray-500 text-white">
                    Event Finished
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-[#ff7c07]" />
                  <span className="text-sm">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-[#ff7c07]" />
                  <span className="text-sm">{event.location}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4 text-[#ff7c07]" />
                  <span className="text-sm">{event.attendees.toLocaleString()} attending</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {isEventFinished ? (
                <Button size="lg" disabled className="bg-gray-400 cursor-not-allowed">
                  Event Finished
                </Button>
              ) : isPremium ? (
                <BuyTicketFlow
                  event={{
                    id: event.id,
                    title: event.title,
                    image: event.image,
                    date: event.date,
                    time: event.time,
                    location: event.location,
                    organizerName: event.organizer,
                    ticketPrice: typeof event.price === 'number' ? event.price : 0,
                    totalTickets: event.totalTickets,
                    ticketsSold: event.ticketsSold,
                    reservedTickets: 0,
                  }}
                  trigger={
                    <Button size="lg" className="bg-[#ff7c07] hover:bg-[#e66f06] text-white">
                      <Ticket className="mr-2 h-5 w-5" />
                      Buy Ticket - ৳{typeof event.price === 'number' ? event.price.toFixed(2) : '0.00'}
                    </Button>
                  }
                />
              ) : (
                <BuyTicketFlow
                  event={{
                    id: event.id,
                    title: event.title,
                    image: event.image,
                    date: event.date,
                    time: event.time,
                    location: event.location,
                    organizerName: event.organizer,
                    ticketPrice: 0,
                    totalTickets: event.totalTickets,
                    ticketsSold: event.ticketsSold,
                    reservedTickets: 0,
                  }}
                  trigger={
                    <Button size="lg" className="bg-[#ff7c07] hover:bg-[#e66f06] text-white">
                      <Ticket className="mr-2 h-5 w-5" />
                      Get Free Ticket
                    </Button>
                  }
                />
              )}
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setIsShareModalOpen(true)}
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share
              </Button>
            </div>
          </div>

          {/* Right Side - Small Ad Space (2 columns) */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end">
            <AdPlaceholder 
              width={450} 
              height={150} 
              title="Premium Ad Space"
              className="max-w-full"
            />
          </div>
        </div>

        {/* Share Modal */}
        <ShareModal
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          url={currentUrl}
          title={event.title}
        />

        {/* Second Row - Event Description and Details */}
        <div className="grid gap-6 lg:grid-cols-5 mt-12">
          {/* Left Side - Event Description (3 columns) */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="flex h-full max-h-[600px] flex-col p-6">
                <h2 className="mb-4 text-2xl font-bold">About This Event</h2>
                
                <div className="prose hide-scrollbar max-w-none overflow-y-auto pr-2">
                  <div 
                    className="text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Event Details with Interactive Map (2 columns) */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Event Details</h2>

                <div className="space-y-4">
                  {/* Date & Time */}
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-[#ff7c07]" />
                      Date & Time
                    </div>
                    <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>

                  <Separator />

                  {/* Organizer */}
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-[#ff7c07]" />
                      Organizer
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{event.organizer}</p>
                    {event.organizationName && (
                      <p className="text-xs text-muted-foreground mt-0.5">{event.organizationName}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Location */}
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-[#ff7c07]" />
                      Location
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{event.location}</p>
                    
                    {/* Interactive Map - only show if locationLink is provided */}
                    {embedMapUrl && (
                      <>
                        <div className="overflow-hidden rounded-lg bg-muted border border-border shadow-sm">
                          <iframe
                            src={embedMapUrl}
                            width="100%"
                            height="250"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Event Location Map"
                          />
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="mt-2 w-full bg-[#ff7c07] hover:bg-[#e66f06] text-white"
                          asChild
                        >
                          <a href={event.locationLink} target="_blank" rel="noopener noreferrer">
                            <MapPin className="mr-2 h-4 w-4" />
                            Get Directions
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                 
                  
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Width Ad Space */}
        <div className="mt-12">
          <AdPlaceholder 
            size="banner"
            height={200}
            title="Large Banner Ad Space"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
