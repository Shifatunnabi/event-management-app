import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Users, Share2, Heart, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { events } from "@/data/events"
import AdPlaceholder from "@/components/ui/ad-placeholder"

export async function generateStaticParams() {
  return events.map((event) => ({
    id: event.id,
  }))
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = events.find((e) => e.id === id)

  if (!event) {
    notFound()
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const formattedTime = "7:00 PM - 11:00 PM"

  const isPremium = event.price !== "Free"

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
              <h1 className="mb-4 text-2xl font-bold lg:text-4xl">{event.title}</h1>

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
              {isPremium ? (
                <Button size="lg" className="bg-[#ff7c07] hover:bg-[#e66f06] text-white">
                  <Ticket className="mr-2 h-5 w-5" />
                  Buy Ticket - ${event.price}
                </Button>
              ) : (
                <>
                  <Button size="lg" className="bg-[#ff7c07] hover:bg-[#e66f06] text-white">
                    <Heart className="mr-2 h-5 w-5" />
                    Interested
                  </Button>
                  <Button size="lg" variant="outline">
                    <Users className="mr-2 h-5 w-5" />
                    Going
                  </Button>
                </>
              )}
              <Button size="lg" variant="outline">
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

        {/* Second Row - Event Description and Details */}
        <div className="grid gap-6 lg:grid-cols-5 mt-12">
          {/* Left Side - Event Description (3 columns) */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="flex h-full max-h-[600px] flex-col p-6">
                <h2 className="mb-4 text-2xl font-bold">About This Event</h2>
                
                <div className="prose hide-scrollbar max-w-none overflow-y-auto pr-2">
                  <p className="mb-4 text-muted-foreground">{event.description}</p>
                  <p className="mb-4 text-muted-foreground">
                    Join us for an unforgettable experience at {event.title}. This event promises to deliver exceptional
                    entertainment, networking opportunities, and memories that will last a lifetime.
                  </p>
                  <h3 className="mb-2 text-xl font-semibold">What to Expect</h3>
                  <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
                    <li>World-class performances and entertainment</li>
                    <li>Networking opportunities with industry professionals</li>
                    <li>Food and beverage options available</li>
                    <li>Exclusive merchandise and photo opportunities</li>
                    <li>Safe and secure venue with professional staff</li>
                  </ul>
                  <h3 className="mb-2 text-xl font-semibold">Important Information</h3>
                  <p className="mb-2 text-muted-foreground">
                    Please arrive at least 30 minutes before the event starts. Tickets are non-refundable but
                    transferable. Valid ID required for entry. Age restrictions may apply.
                  </p>
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
                    <p className="text-sm text-muted-foreground">{formattedTime}</p>
                  </div>

                  <Separator />

                  {/* Organizer */}
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-[#ff7c07]" />
                      Organizer
                    </div>
                    <p className="text-sm text-muted-foreground">{event.organizer}</p>
                  </div>

                  <Separator />

                  {/* Location */}
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-[#ff7c07]" />
                      Location
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{event.location}</p>
                    
                    {/* Interactive Map */}
                    <div className="overflow-hidden rounded-lg bg-muted border border-border">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.91476818218!2d-74.11976314071885!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1699000000000"
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Event Location Map"
                      />
                    </div>
                    
                    <Button size="sm" className="mt-2 w-full border border-black hover:bg-white hover:text-black">
                      <MapPin className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
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
