"use client"

import { useState } from "react"
import { Share2, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import ShareModal from "@/components/ui/share-modal"
import BuyTicketFlowNew from "@/components/tickets/BuyTicketFlowNew"

interface EventDetailsClientProps {
  event: {
    id: string
    slug: string
    title: string
    image: string
    date: string
    time: string
    location: string
    organizer: string
    price: number | "Free"
    ticketType: "FREE" | "PREMIUM"
    totalTickets?: number
    ticketsSold: number
    ticketTypes?: {
      name: string
      price: number
      available: number | null
    }[]
    bkashNumber?: string
  }
  isEventFinished: boolean
}

export default function EventDetailsClient({ event, isEventFinished }: EventDetailsClientProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const isPremium = event.ticketType === "PREMIUM"

  if (isEventFinished) {
    return (
      <>
        <Button size="lg" disabled className="bg-gray-400 cursor-not-allowed">
          Event Finished
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => setIsShareModalOpen(true)}
        >
          <Share2 className="mr-2 h-5 w-5" />
          Share
        </Button>
        <ShareModal
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          url={typeof window !== "undefined" ? window.location.href : ""}
          title={event.title}
        />
      </>
    )
  }

  return (
    <>
      {isPremium ? (
        <BuyTicketFlowNew
          event={{
            id: event.id,
            slug: event.slug,
            title: event.title,
            image: event.image,
            date: event.date,
            time: event.time,
            location: event.location,
            organizerName: event.organizer,
            ticketTypes: event.ticketTypes || [{
              name: "General Admission",
              price: typeof event.price === 'number' ? event.price : 0,
              available: event.totalTickets ? event.totalTickets - event.ticketsSold : null,
            }],
            bkashNumber: event.bkashNumber,
          }}
          trigger={
            <Button size="lg" className="bg-[#ff7c07] hover:bg-[#e66f06] text-white">
              <Ticket className="mr-2 h-5 w-5" />
              Buy Ticket - ৳{typeof event.price === 'number' ? event.price.toFixed(2) : '0.00'}
            </Button>
          }
        />
      ) : (
        <BuyTicketFlowNew
          event={{
            id: event.id,
            slug: event.slug,
            title: event.title,
            image: event.image,
            date: event.date,
            time: event.time,
            location: event.location,
            organizerName: event.organizer,
            ticketTypes: event.ticketTypes || [{
              name: "Free Entry",
              price: 0,
              available: event.totalTickets ? event.totalTickets - event.ticketsSold : null,
            }],
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
      <ShareModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        url={typeof window !== "undefined" ? window.location.href : ""}
        title={event.title}
      />
    </>
  )
}
