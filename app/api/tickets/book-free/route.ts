import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"
import TicketBooking from "@/lib/db/models/TicketBooking"
import crypto from "crypto"

// Generate unique ticket ID and QR signature
function generateTicketData(bookingId: string, ticketIndex: number) {
  const ticketId = `${bookingId}-${ticketIndex + 1}`
  const qrSignature = crypto
    .createHash("sha256")
    .update(`${ticketId}-${Date.now()}`)
    .digest("hex")
  
  return { ticketId, qrSignature }
}

// POST - Book free tickets (instantly creates CONFIRMED booking)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { eventId, eventSlug, ticketType, quantity } = body

    // Validate required fields
    if (!eventId || !eventSlug || !ticketType || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get event
    const event = await Event.findById(eventId)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Event is not available for booking" },
        { status: 400 }
      )
    }

    // Find the ticket type
    const selectedTicketType = event.ticketTypes.find(
      (t: any) => t.name === ticketType
    )

    if (!selectedTicketType) {
      return NextResponse.json({ error: "Ticket type not found" }, { status: 404 })
    }

    // Verify it's a free ticket
    if (selectedTicketType.price !== 0) {
      return NextResponse.json(
        { error: "This is not a free ticket. Please use the payment flow." },
        { status: 400 }
      )
    }

    // Check availability (if limited)
    if (selectedTicketType.hasLimit && selectedTicketType.available !== null) {
      if (selectedTicketType.available < quantity) {
        return NextResponse.json(
          { error: `Only ${selectedTicketType.available} tickets available` },
          { status: 400 }
        )
      }
    }

    const now = new Date()

    // Create CONFIRMED booking (no payment needed for free tickets)
    const booking = await TicketBooking.create({
      eventId: event._id,
      eventSlug: event.slug,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      eventImage: event.image,
      
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || "",
      
      ticketType,
      numberOfTickets: quantity,
      pricePerTicket: 0,
      totalAmount: 0,
      
      status: "CONFIRMED",
      ticketsSent: false,
      emailRetryCount: 0,
      tickets: [],
      
      reservedAt: now,
      expiresAt: now, // Not applicable for free tickets
      confirmedAt: now,
    })

    // Generate tickets with QR codes
    const tickets = []
    for (let i = 0; i < quantity; i++) {
      const { ticketId, qrSignature } = generateTicketData(booking._id.toString(), i)
      tickets.push({
        ticketId,
        ticketType,
        qrCode: qrSignature, // Will be used to generate QR code image
        qrSignature,
      })
    }

    booking.tickets = tickets
    await booking.save()

    // Update ticket count and attendees
    if (selectedTicketType.hasLimit && selectedTicketType.available !== null) {
      selectedTicketType.available -= quantity
      selectedTicketType.sold += quantity
    }
    event.ticketsSold += quantity
    event.attendees = (event.attendees || 0) + quantity
    await event.save()

    // TODO: Send email with tickets (will be implemented in email service)
    // For now, just mark as pending email send
    // The send-ticket API will handle email sending

    return NextResponse.json(
      {
        success: true,
        message: "Free tickets booked successfully",
        bookingId: booking._id.toString(),
        tickets: tickets.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error booking free tickets:", error)
    return NextResponse.json(
      { error: "Failed to book free tickets" },
      { status: 500 }
    )
  }
}
