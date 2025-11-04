"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, QrCode, Eye, Ticket } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { UserTicket } from "@/data/user-tickets"

interface TicketCardProps {
  ticket: UserTicket
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const [showQR, setShowQR] = useState(false)

  const eventDate = new Date(ticket.eventDate)
  const day = eventDate.getDate()
  const month = eventDate.toLocaleDateString("en-US", { month: "short" })

  return (
    <>
      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-bold">{ticket.eventTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {month} {day}, {eventDate.getFullYear()}
              </p>
            </div>
            <div className="flex justify-center">
              <div className="rounded-lg border-4 border-purple-600 p-4">
                <Image
                  src={ticket.qrCode || "/placeholder.svg"}
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="h-48 w-48"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ticket ID</p>
              <p className="font-mono text-lg font-bold">{ticket.id}</p>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Show this QR code at the venue entrance for verification
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="group overflow-hidden border-b-2 border-b-black/50 bg-white p-0 transition-all hover:shadow-lg">
        {/* Event Banner Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={ticket.eventImage || "/placeholder.svg"}
            alt={ticket.eventTitle}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* Card Content */}
        <div className="space-y-3 p-4">
          {/* Event Title */}
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-gray-900">{ticket.eventTitle}</h3>

          {/* Date, Location, and Details section */}
          <div className="flex gap-3">
            {/* Date box on the left */}
            <div className="w-16 flex-shrink-0 rounded-lg bg-[#ff7c07] p-3 text-center text-white">
              <div className="text-2xl font-bold leading-none">{day}</div>
              <div className="mt-1 text-xs uppercase">{month}</div>
            </div>

            {/* Location and Details on the right */}
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span className="line-clamp-1">{ticket.eventLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <QrCode className="h-4 w-4 flex-shrink-0 text-green-600" />
                <span className="line-clamp-1">Ticket ID: {ticket.id}</span>
              </div>
            </div>
          </div>

          {/* Ticket Type and Price */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">{ticket.ticketType}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-purple-600">
                {ticket.price === "Free" ? "Free" : `$${ticket.price}`}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => setShowQR(true)} className="flex-1 bg-[#ff7c07] hover:bg-[#e66f06]">
              <QrCode className="mr-2 h-4 w-4" />
              View Ticket
            </Button>
            <Link href={`/events/${ticket.eventId}`} className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </>
  )
}
