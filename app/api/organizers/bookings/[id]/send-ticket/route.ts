import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db/mongodb"
import TicketBooking from "@/lib/db/models/TicketBooking"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"
import Ticket from "@/lib/db/models/Ticket"
import crypto from "crypto"
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

    // Only allow sending tickets for PENDING bookings
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only send tickets for pending bookings" },
        { status: 400 }
      )
    }

    // Generate tickets if they don't exist
    if (!booking.tickets || booking.tickets.length === 0) {
      // Get QR code types from the event
      const qrCodeTypes = event.qrCodeTypes || ["entry"]
      const tickets = []
      
      for (let i = 0; i < booking.numberOfTickets; i++) {
        const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        
        // Generate a QR code for each type selected by the organizer
        for (const qrCodeType of qrCodeTypes) {
          const qrCode = `${ticketId}-${qrCodeType}`
          const qrSignature = crypto
            .createHash("sha256")
            .update(`${qrCode}-${booking._id}-${Date.now()}-${Math.random()}`)
            .digest("hex")

          tickets.push({
            ticketId,
            ticketType: booking.ticketType,
            qrCodeType,
            qrCode,
            qrSignature,
            scanned: false,
          })
        }
      }
      booking.tickets = tickets
      
      // Save booking to get the updated tickets in the database
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

    // Send email with PDF (with 3 retries)
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
      booking.status = "CONFIRMED"
      booking.ticketsSent = true
      booking.emailSentAt = new Date()
      booking.confirmedAt = new Date()
      
      // Save booking with updated status
      await booking.save()

      // Update event ticket counts and attendees
      if (event.ticketTypes && event.ticketTypes.length > 0) {
        const ticketType = event.ticketTypes.find((t: any) => t.name === booking.ticketType)
        if (ticketType && ticketType.hasLimit) {
          ticketType.sold = (ticketType.sold || 0) + booking.numberOfTickets
        }
      }
      event.ticketsSold = (event.ticketsSold || 0) + booking.numberOfTickets
      event.attendees = (event.attendees || 0) + booking.numberOfTickets
      await event.save()

      return NextResponse.json({
        message: "Tickets sent successfully",
        booking: {
          _id: booking._id.toString(),
          status: booking.status,
          ticketsSent: booking.ticketsSent,
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
      
      // Still update to CONFIRMED but mark email as not sent
      booking.status = "CONFIRMED"
      booking.ticketsSent = false
      booking.emailRetryCount = (booking.emailRetryCount || 0) + 1
      booking.confirmedAt = new Date()
      
      // Save booking
      await booking.save()

      // Update event ticket counts and attendees even if email fails
      if (event.ticketTypes && event.ticketTypes.length > 0) {
        const ticketType = event.ticketTypes.find((t: any) => t.name === booking.ticketType)
        if (ticketType && ticketType.hasLimit) {
          ticketType.sold = (ticketType.sold || 0) + booking.numberOfTickets
        }
      }
      event.ticketsSold = (event.ticketsSold || 0) + booking.numberOfTickets
      event.attendees = (event.attendees || 0) + booking.numberOfTickets
      await event.save()

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
