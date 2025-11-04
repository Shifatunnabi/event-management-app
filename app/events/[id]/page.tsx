import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Users, Share2, Heart, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { events } from "@/data/events"

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
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const formattedTime = "7:00 PM - 11:00 PM"

  const isPremium = event.price !== "Free"

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="relative h-[200px] w-full overflow-hidden rounded-2xl md:h-[300px] lg:h-[400px]">
          <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="mb-4 text-2xl font-bold lg:text-4xl">{event.title}</h1>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 text-purple-600" />
              <span className="font-medium">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Organized by {event.organizer}</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
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

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Side - Description (3 columns) with scroll */}
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

          <div className="lg:col-span-2">
            <Card className="h-full max-h-[600px]">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Event Details</h2>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      Date & Time
                    </div>
                    <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">{formattedTime}</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      Location
                    </div>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-purple-600" />
                      Organizer
                    </div>
                    <p className="text-sm text-muted-foreground">{event.organizer}</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="mb-1 text-sm font-medium">Category</div>
                    <Badge variant="secondary">{event.category}</Badge>
                  </div>

                  <Separator />

                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-purple-600" />
                      Attendees
                    </div>
                    <p className="text-sm text-muted-foreground">{event.attendees.toLocaleString()} people attending</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="mb-1 text-sm font-medium">Price</div>
                    <p className="text-2xl font-bold text-purple-600">
                      {event.price === "Free" ? "Free Entry" : `$${event.price}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-6 text-center text-2xl font-bold lg:text-3xl">Venue Location</h2>

          <div className="overflow-hidden rounded-2xl bg-muted border border-black/30">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5906537057!2d100.56415431483!3d13.746780990356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29ed269b534f3%3A0x9a5012ba7a3e3c1!2sBangkok%2C%20Thailand!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Event Location Map"
            />
          </div>

          <div className="mt-6 flex justify-center">
            <Button size="lg" variant="outline" className="bg-black text-white">
              <MapPin className="mr-2 h-5 w-5" />
              Get Directions
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
