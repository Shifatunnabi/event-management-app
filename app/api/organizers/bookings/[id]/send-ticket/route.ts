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

// Background email sending function (fire-and-forget)
async function sendTicketEmailAsync(
  bookingId: string,
  bookingData: any,
  eventData: any
) {
  try {
    console.log(`[Background] Starting email generation for booking ${bookingId}`)
    
    // Re-connect to DB (background context)
    await dbConnect()
    
    // Generate PDF
    const pdfBuffer = await generateTicketPDF(bookingData, eventData)
    
    console.log(`[Background] PDF generated for booking ${bookingId}, sending email...`)
    
    // Send email
    await sendTicketEmail(
      bookingData.userEmail,
      bookingData.userName,
      eventData.title,
      bookingData.numberOfTickets,
      pdfBuffer,
      new Date(eventData.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      `${eventData.startTime} - ${eventData.endTime}`,
      eventData.location
    )
    
    console.log(`[Background] Email sent successfully for booking ${bookingId}`)
    
    // Update booking to mark email as sent
    const booking = await TicketBooking.findById(bookingId)
    if (booking) {
      booking.ticketsSent = true
      booking.emailSentAt = new Date()
      await booking.save()
    }
    
  } catch (error: any) {
    console.error(`[Background] Email failed for booking ${bookingId}:`, {
      message: error.message,
      code: error.code,
      userEmail: bookingData.userEmail,
    })
    
    // Update retry count
    try {
      const booking = await TicketBooking.findById(bookingId)
      if (booking) {
        booking.emailRetryCount = (booking.emailRetryCount || 0) + 1
        await booking.save()
      }
    } catch (updateError) {
      console.error(`[Background] Failed to update retry count for ${bookingId}`)
    }
  }
}

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
          // Set legacy qrData to avoid unique constraint issues (use first QR code's data)
          qrData: qrCodes.length > 0 ? qrCodes[0].qrData : ticketId,
          qrSignature: qrCodes.length > 0 ? qrCodes[0].qrSignature : "",
        })
        ticketDocs.push(ticketDoc)
      }
      
      // Try to drop the old qrData unique index if it exists (one-time migration)
      try {
        await Ticket.collection.dropIndex("qrData_1")
      } catch (e) {
        // Index might not exist or already dropped, continue
      }
      
      // Save all tickets
      await Ticket.insertMany(ticketDocs)
    }

    // Update booking status to CONFIRMED immediately
    booking.status = "CONFIRMED"
    booking.confirmedAt = new Date()
    booking.ticketsSent = false // Will be updated by background process
    await booking.save()

    // Update event ticket counts and attendees immediately
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const ticketType = event.ticketTypes.find((t: any) => t.name === booking.ticketType)
      if (ticketType && ticketType.hasLimit) {
        ticketType.sold = (ticketType.sold || 0) + booking.numberOfTickets
      }
    }
    event.ticketsSold = (event.ticketsSold || 0) + booking.numberOfTickets
    event.attendees = (event.attendees || 0) + booking.numberOfTickets
    await event.save()

    // Fire off email sending in background (don't wait for it)
    const bookingData = {
      _id: booking._id.toString(),
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      numberOfTickets: booking.numberOfTickets,
      totalAmount: booking.totalAmount,
      tickets: booking.tickets,
    }
    
    const eventData = {
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: event.location,
      organizerName: event.organizerName || user.name || "Event Organizer",
    }
    
    // Send email asynchronously (fire-and-forget)
    sendTicketEmailAsync(booking._id.toString(), bookingData, eventData).catch((err) => {
      console.error("Background email process failed:", err)
    })

    // Return success immediately (< 2 seconds)
    return NextResponse.json({
      message: "Tickets confirmed successfully. Email will be sent shortly.",
      booking: {
        _id: booking._id.toString(),
        status: booking.status,
        ticketsSent: false, // Email sending in progress
        emailPending: true,
      },
    })
  } catch (error: any) {
    console.error("Error sending ticket:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send ticket" },
      { status: 500 }
    )
  }
}
