import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"
import TicketBooking from "@/lib/db/models/TicketBooking"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { eventId, eventSlug, ticketType, quantity, pricePerTicket } = await req.json()

    // Validation
    if (!eventId || !eventSlug || !ticketType || !quantity || pricePerTicket === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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

    // Find event
    const event = await Event.findById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    console.log("Reserve Ticket - Event Details:", {
      eventId: event._id,
      eventSlug: event.slug,
      eventTitle: event.title,
      hasSlug: !!event.slug
    })

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

    // Check availability (if limited)
    if (selectedTicketType.hasLimit && selectedTicketType.available !== null) {
      if (selectedTicketType.available < quantity) {
        return NextResponse.json(
          { error: `Only ${selectedTicketType.available} tickets available` },
          { status: 400 }
        )
      }
    }

    // Cancel any existing RESERVED bookings for this user and event (they took too long)
    await TicketBooking.updateMany(
      {
        userId: user._id,
        eventId,
        status: "RESERVED",
      },
      {
        $set: { status: "EXPIRED" },
      }
    )

    // Calculate expiry time (20 minutes from now)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 20 * 60 * 1000) // 20 minutes

    // Create RESERVED booking
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
      pricePerTicket,
      totalAmount: quantity * pricePerTicket,
      
      status: "RESERVED",
      ticketsSent: false,
      emailRetryCount: 0,
      tickets: [],
      
      reservedAt: now,
      expiresAt,
    })

    console.log("Booking Created:", {
      bookingId: booking._id,
      eventSlug: booking.eventSlug,
      status: booking.status,
      userEmail: booking.userEmail
    })

    // Temporarily reduce available tickets
    if (selectedTicketType.hasLimit && selectedTicketType.available !== null) {
      selectedTicketType.available -= quantity
      await event.save()
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tickets reserved successfully",
        reservationId: booking._id.toString(),
        expiresAt: expiresAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Reservation error:", error)
    return NextResponse.json(
      { error: "Failed to reserve tickets" },
      { status: 500 }
    )
  }
}
