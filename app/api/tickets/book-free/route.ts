import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"
import TicketBooking from "@/lib/db/models/TicketBooking"
import Ticket from "@/lib/db/models/Ticket"
import crypto from "crypto"

// Generate unique ticket ID and QR signature for a specific QR code type
function generateTicketData(bookingId: string, ticketIndex: number, qrCodeType: string) {
  const ticketId = `${bookingId}-${ticketIndex + 1}`
  const qrCode = `${ticketId}-${qrCodeType}`
  const qrSignature = crypto
    .createHash("sha256")
    .update(`${qrCode}-${Date.now()}-${Math.random()}`)
    .digest("hex")
  
  return { ticketId, qrCode, qrSignature, qrCodeType }
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

    // Check if user already has tickets for this event
    const existingBooking = await TicketBooking.findOne({
      userId: user._id,
      eventSlug,
      status: { $in: ["RESERVED", "PENDING", "CONFIRMED"] },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: "You have already purchased tickets for this event" },
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
      eventStartTime: event.startTime,
      eventEndTime: event.endTime,
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

    // Generate tickets with multiple QR codes based on event's qrCodeTypes
    const qrCodeTypes = event.qrCodeTypes || ["entry"]
    const tickets = []
    
    for (let i = 0; i < quantity; i++) {
      const ticketId = `${booking._id.toString()}-${i + 1}`
      
      // Generate a QR code for each type selected by the organizer
      for (const qrCodeType of qrCodeTypes) {
        const { qrCode, qrSignature } = generateTicketData(booking._id.toString(), i, qrCodeType)
        tickets.push({
          ticketId,
          ticketType,
          qrCodeType,
          qrCode,
          qrSignature,
          scanned: false,
        })
      }
    }

    booking.tickets = tickets
    await booking.save()

    // Create individual Ticket documents for each ticket
    const ticketDocs = []
    const ticketMap = new Map() // Group by ticketId
    
    for (const ticket of booking.tickets) {
      if (!ticketMap.has(ticket.ticketId)) {
        ticketMap.set(ticket.ticketId, [])
      }
      ticketMap.get(ticket.ticketId).push({
        qrCodeType: ticket.qrCodeType,
        qrData: ticket.qrCode,
        qrSignature: ticket.qrSignature,
        scanned: false,
      })
    }
    
    // Create one Ticket document per unique ticketId with all QR codes
    for (const [ticketId, qrCodes] of ticketMap.entries()) {
      const ticketDoc = new Ticket({
        ticketId,
        bookingId: booking._id,
        eventId: event._id,
        eventSlug: event.slug,
        eventTitle: event.title,
        eventDate: event.date,
        eventStartTime: event.startTime,
        eventEndTime: event.endTime,
        eventLocation: event.location,
        userId: booking.userId,
        userEmail: booking.userEmail,
        userName: booking.userName,
        ticketType: booking.ticketType,
        qrCodes,
        status: "ACTIVE",
      })
      ticketDocs.push(ticketDoc)
    }
    
    // Save all tickets
    await Ticket.insertMany(ticketDocs)

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
