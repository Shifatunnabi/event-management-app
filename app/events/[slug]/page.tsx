import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import AdPlaceholder from "@/components/ui/ad-placeholder"
import EventDetailsClient from "@/components/events/EventDetailsClient"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"

interface EventType {
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
  ticketTypes?: {
    name: string
    price: number
    available: number | null
  }[]
  bkashNumber?: string
}

async function getEvent(slug: string): Promise<EventType | null> {
  try {
    await connectDB()

    const event: any = await Event.findOne({ slug, status: { $ne: "HIDDEN" } })
      .select("-interested -going")
      .lean()

    if (!event) {
      return null
    }

    // Determine ticket type based on ticket prices
    const ticketTypes = event.ticketTypes || []
    
    // If no ticket types, it's a free event
    if (ticketTypes.length === 0) {
      return {
        id: event._id.toString(),
        slug: event.slug,
        title: event.title,
        description: event.description,
        image: event.image,
        date: event.date.toISOString().split("T")[0],
        time: event.time,
        location: event.location,
        locationLink: event.locationLink,
        category: event.category,
        organizer: event.organizerName,
        organizationName: event.organizationName,
        price: "Free",
        ticketType: "FREE",
        ticketTypes: [],
        bkashNumber: event.bkashNumber,
        hasTicketLimit: event.hasCapacityLimit,
        totalTickets: event.totalCapacity,
        ticketsSold: event.ticketsSold || 0,
        attendees: event.attendees || 0,
        isFeatured: event.isFeatured || false,
      }
    }

    // Has ticket types - determine if FREE or PREMIUM
    const hasAnyPaid = ticketTypes.some((t: any) => t.price > 0)
    const ticketType = hasAnyPaid ? "PREMIUM" : "FREE"
    const minPrice = Math.min(...ticketTypes.map((t: any) => t.price))

    const transformedTicketTypes = ticketTypes.map((t: any) => ({
      name: t.name,
      price: t.price,
      available: t.hasLimit ? t.available : null,
    }))

    return {
      id: event._id.toString(),
      slug: event.slug,
      title: event.title,
      description: event.description,
      image: event.image,
      date: event.date.toISOString().split("T")[0],
      time: event.time,
      location: event.location,
      locationLink: event.locationLink,
      category: event.category,
      organizer: event.organizerName,
      organizationName: event.organizationName,
      price: minPrice === 0 ? "Free" : minPrice,
      ticketType: ticketType,
      ticketTypes: transformedTicketTypes,
      bkashNumber: event.bkashNumber,
      hasTicketLimit: event.hasCapacityLimit,
      totalTickets: event.totalCapacity,
      ticketsSold: event.ticketsSold || 0,
      attendees: event.attendees || 0,
      isFeatured: event.isFeatured || false,
    }
  } catch (error) {
    console.error("Error fetching event:", error)
    return null
  }
}

export default async function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
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
              <EventDetailsClient event={event} isEventFinished={isEventFinished} />
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
