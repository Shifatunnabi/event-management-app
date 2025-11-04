import Image from "next/image"
import Link from "next/link"
import { MapPin, Ticket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Event } from "@/data/events"

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date)
  const day = eventDate.getDate()
  const month = eventDate.toLocaleDateString("en-US", { month: "short" })

  return (
    <Link href={`/events/${event.id}`}>
      <div className="group overflow-hidden transition-all hover:shadow-lg border-b-2 border-b-black/50 bg-gray-300/30 rounded-lg">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {event.isFeatured && (
            <Badge className="absolute right-3 top-3 bg-amber-500 text-white hover:bg-amber-600">Featured</Badge>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Title directly below image */}
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 leading-tight">{event.title}</h3>

          {/* Date, Location, and Price section */}
          <div className="flex gap-3">
            {/* Date box on the left */}
            <div className="flex-shrink-0 bg-[#ff7c07] border-2 border-black rounded-lg p-3 text-center w-16">
              <div className="text-2xl font-bold leading-none">{day}</div>
              <div className="text-xs font-bold uppercase mt-1">{month}</div>
            </div>

            {/* Location and Price on the right */}
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 flex-shrink-0 text-green-600" />
                <span className="font-semibold text-gray-900">
                  {event.price === "Free" ? "Free Entry" : `Price starts from $${event.price}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
