import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db/mongodb"
import TicketBooking from "@/lib/db/models/TicketBooking"
import Event from "@/lib/db/models/Event"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const now = new Date()

    // Find all RESERVED bookings that have expired
    const expiredBookings: any[] = await TicketBooking.find({
      status: "RESERVED",
      expiresAt: { $lt: now },
    })

    console.log(`Found ${expiredBookings.length} expired reservations`)

    let updatedCount = 0
    let releasedTickets = 0

    // Process each expired booking
    for (const booking of expiredBookings) {
      try {
        // Find the event
        const event: any = await Event.findOne({ slug: booking.eventSlug })

        if (event && event.ticketTypes && event.ticketTypes.length > 0) {
          // Release the tickets back to available pool
          event.ticketTypes[0].available += booking.numberOfTickets
          await event.save()
          releasedTickets += booking.numberOfTickets
        }

        // Update booking status to EXPIRED
        booking.status = "EXPIRED"
        await booking.save()
        updatedCount++
      } catch (error) {
        console.error(`Failed to process booking ${booking._id}:`, error)
      }
    }

    return NextResponse.json({
      message: "Cleanup completed",
      expiredBookings: updatedCount,
      ticketsReleased: releasedTickets,
    })
  } catch (error: any) {
    console.error("Error cleaning up expired bookings:", error)
    return NextResponse.json(
      { error: error.message || "Failed to cleanup expired bookings" },
      { status: 500 }
    )
  }
}

// Allow GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request)
}
