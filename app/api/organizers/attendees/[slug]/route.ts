import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import TicketBooking from "@/lib/db/models/TicketBooking"
import User from "@/lib/db/models/User"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { slug } = params

    // Find the event and verify ownership
    const event: any = await Event.findOne({ slug }).lean()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Verify the organizer owns this event
    const user: any = await User.findById(session.user.id).lean()
    if (!user || user.role !== "ORGANIZER" || event.organizerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch all bookings for this event (excluding RESERVED and EXPIRED)
    const bookings = await TicketBooking.find({
      eventSlug: slug,
      status: { $in: ["PENDING", "CONFIRMED", "REJECTED"] },
    })
      .sort({ createdAt: -1 })
      .lean()

    // Calculate stats
    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED")
    const pendingBookings = bookings.filter((b) => b.status === "PENDING")

    const totalSold = confirmedBookings.reduce((sum, b) => sum + b.numberOfTickets, 0)
    const totalPending = pendingBookings.reduce((sum, b) => sum + b.numberOfTickets, 0)
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0)

    // Get ticket price from event
    let ticketPrice = 0
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      ticketPrice = event.ticketTypes[0].price || 0
    }

    // Format bookings for response
    const formattedBookings = bookings.map((booking: any) => ({
      _id: booking._id.toString(),
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      numberOfTickets: booking.numberOfTickets,
      totalAmount: booking.totalAmount,
      senderBkashNumber: booking.senderBkashNumber,
      transactionId: booking.transactionId,
      status: booking.status,
      ticketsSent: booking.ticketsSent || false,
      tickets: booking.tickets || [],
      createdAt: booking.createdAt,
    }))

    return NextResponse.json({
      bookings: formattedBookings,
      stats: {
        totalSold,
        totalPending,
        totalRevenue,
        ticketPrice,
      },
      eventTitle: event.title,
    })
  } catch (error: any) {
    console.error("Error fetching attendees:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch attendees" },
      { status: 500 }
    )
  }
}
