import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db/mongodb"
import TicketBooking from "@/lib/db/models/TicketBooking"
import Event from "@/lib/db/models/Event"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find all CONFIRMED bookings for the user
    const bookings: any[] = await TicketBooking.find({
      userId: session.user.id,
      status: "CONFIRMED",
    })
      .sort({ createdAt: -1 })
      .lean()

    // Group by event
    const eventMap = new Map()

    for (const booking of bookings) {
      // Fetch event details
      const event: any = await Event.findOne({ slug: booking.eventSlug }).lean()

      if (!event) continue

      const eventId = event._id.toString()

      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          event: {
            id: eventId,
            slug: event.slug,
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            locationLink: event.locationLink,
            organizerName: event.organizerName || "Event Organizer",
            image: event.image || "/images/placeholder-event.jpg",
            ticketPrice: event.ticketTypes && event.ticketTypes.length > 0
              ? event.ticketTypes[0].price || 0
              : 0,
          },
          tickets: [],
          totalTickets: 0,
          totalAmount: 0,
          scannedCount: 0,
          activeCount: 0,
          expiredCount: 0,
        })
      }

      const group = eventMap.get(eventId)

      // Add all tickets from this booking
      for (const ticket of booking.tickets || []) {
        const status = ticket.used
          ? "SCANNED"
          : new Date(event.date) < new Date()
          ? "EXPIRED"
          : "ACTIVE"

        group.tickets.push({
          id: ticket.ticketId,
          qrData: JSON.stringify({
            ticketId: ticket.ticketId,
            bookingId: booking._id.toString(),
            qrSignature: ticket.qrSignature,
            eventTitle: event.title,
          }),
          qrSignature: ticket.qrSignature,
          status,
          price: group.event.ticketPrice,
          purchaseDate: booking.createdAt,
          scannedAt: ticket.scannedAt,
          emailSent: booking.ticketsSent || false,
        })

        group.totalTickets++
        group.totalAmount += group.event.ticketPrice

        if (status === "SCANNED") group.scannedCount++
        else if (status === "ACTIVE") group.activeCount++
        else group.expiredCount++
      }
    }

    const ticketGroups = Array.from(eventMap.values())

    return NextResponse.json({
      success: true,
      ticketGroups,
    })
  } catch (error: any) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch tickets" },
      { status: 500 }
    )
  }
}
