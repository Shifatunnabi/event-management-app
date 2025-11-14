import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db/mongodb"
import TicketBooking from "@/lib/db/models/TicketBooking"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"
import { generateTicketPDF } from "@/lib/utils/pdf-generator"
import { sendTicketEmail } from "@/lib/email/ticket-email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { id } = await params

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

    // Only allow resending for CONFIRMED bookings
    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Can only resend email for confirmed bookings" },
        { status: 400 }
      )
    }

    // Check if tickets exist
    if (!booking.tickets || booking.tickets.length === 0) {
      return NextResponse.json(
        { error: "No tickets found for this booking" },
        { status: 400 }
      )
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
        date: event.date,
        time: event.time,
        location: event.location,
      }
    )

    // Send email with PDF
    try {
      await sendTicketEmail(
        booking.userEmail,
        booking.userName,
        event.title,
        booking.numberOfTickets,
        pdfBuffer,
        new Date(event.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        event.time,
        event.location
      )

      // Update booking status
      booking.ticketsSent = true
      booking.emailSentAt = new Date()
      booking.emailRetryCount = (booking.emailRetryCount || 0) + 1
      await booking.save()

      return NextResponse.json({
        message: "Email sent successfully",
        booking: {
          _id: booking._id.toString(),
          ticketsSent: booking.ticketsSent,
          emailSentAt: booking.emailSentAt,
        },
      })
    } catch (emailError: any) {
      console.error("Failed to send email:", {
        message: emailError.message,
        code: emailError.code,
        stack: emailError.stack,
        bookingId: booking._id.toString(),
        userEmail: booking.userEmail,
      })
      
      // Update retry count
      booking.emailRetryCount = (booking.emailRetryCount || 0) + 1
      await booking.save()

      return NextResponse.json(
        {
          error: "Failed to send email. Please try again.",
          details: emailError.message,
          code: emailError.code,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error resending email:", error)
    return NextResponse.json(
      { error: error.message || "Failed to resend email" },
      { status: 500 }
    )
  }
}
