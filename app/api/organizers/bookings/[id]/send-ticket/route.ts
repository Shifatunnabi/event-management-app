import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db/mongodb"
import TicketBooking from "@/lib/db/models/TicketBooking"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"
import crypto from "crypto"
import { generateTicketPDF } from "@/lib/utils/pdf-generator"
import { sendTicketEmail } from "@/lib/email/ticket-email"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { id } = params

    // Find the booking
    const booking: any = await TicketBooking.findById(id)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Find the event
    const event: any = await Event.findOne({ slug: booking.eventSlug })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Verify the organizer owns this event
    const user: any = await User.findById(session.user.id)
    if (!user || user.role !== "ORGANIZER" || event.organizerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Only allow sending tickets for PENDING bookings
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only send tickets for pending bookings" },
        { status: 400 }
      )
    }

    // Generate tickets if they don't exist
    if (!booking.tickets || booking.tickets.length === 0) {
      const tickets = []
      for (let i = 0; i < booking.numberOfTickets; i++) {
        const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        const qrSignature = crypto
          .createHash("sha256")
          .update(`${ticketId}-${booking._id}-${Date.now()}`)
          .digest("hex")

        tickets.push({
          ticketId,
          qrSignature,
          used: false,
        })
      }
      booking.tickets = tickets
    }

    // Generate PDF
    const pdfBuffer = await generateTicketPDF(
      {
        _id: booking._id.toString(),
        userName: booking.userName,
        userEmail: booking.userEmail,
        userPhone: booking.userPhone,
        numberOfTickets: booking.numberOfTickets,
        totalAmount: booking.totalAmount,
        tickets: booking.tickets,
      },
      {
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        venue: event.venue,
      }
    )

    // Send email with PDF (with 3 retries)
    try {
      await sendTicketEmail(
        booking.userEmail,
        booking.userName,
        event.title,
        booking.numberOfTickets,
        pdfBuffer
      )

      // Update booking status
      booking.status = "CONFIRMED"
      booking.ticketsSent = true
      booking.emailSentAt = new Date()
      await booking.save()

      return NextResponse.json({
        message: "Tickets sent successfully",
        booking: {
          _id: booking._id.toString(),
          status: booking.status,
          ticketsSent: booking.ticketsSent,
        },
      })
    } catch (emailError: any) {
      console.error("Failed to send email:", emailError)
      
      // Still update to CONFIRMED but mark email as not sent
      booking.status = "CONFIRMED"
      booking.ticketsSent = false
      booking.emailRetryCount = (booking.emailRetryCount || 0) + 3
      await booking.save()

      return NextResponse.json(
        {
          error: "Tickets confirmed but email failed to send. Please try resending.",
          booking: {
            _id: booking._id.toString(),
            status: booking.status,
            ticketsSent: booking.ticketsSent,
          },
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error sending ticket:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send ticket" },
      { status: 500 }
    )
  }
}
