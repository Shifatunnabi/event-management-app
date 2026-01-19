import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Ticket from "@/lib/db/models/Ticket";
import TicketBooking from "@/lib/db/models/TicketBooking";
import Event from "@/lib/db/models/Event";
import { validateAndParseQR } from "@/lib/utils/qrGenerator";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { qrData, qrSignature, eventId } = await req.json();

    // Validation
    if (!qrData || !qrSignature) {
      return NextResponse.json(
        { error: "QR data and signature are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Try to parse QR data to check if it contains qrCodeType (new format)
    let parsedQRData: any = null
    try {
      parsedQRData = JSON.parse(qrData)
    } catch (e) {
      // Old format, continue with regular flow
    }

    // Check if this is a new multi-QR ticket (TicketBooking)
    if (parsedQRData && parsedQRData.qrCodeType) {
      // New format with multiple QR codes
      const { qrCodeType, bookingId } = parsedQRData

      const booking: any = await TicketBooking.findById(bookingId)
      
      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      // Get event details
      const event = await Event.findById(booking.eventId);
      if (!event) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      }

      // Check if user is the organizer or admin
      const isOrganizer = event.organizerId.toString() === session.user.id;
      const isAdmin = session.user.role === "SUPER_ADMIN";

      if (!isOrganizer && !isAdmin) {
        return NextResponse.json(
          { error: "Only the event organizer or admin can scan tickets" },
          { status: 403 }
        );
      }

      // Find the specific QR code in the booking
      const qrCodeEntry = booking.tickets.find(
        (t: any) => t.qrSignature === qrSignature && t.qrCodeType === qrCodeType
      )

      if (!qrCodeEntry) {
        return NextResponse.json(
          { error: "QR code not found in booking" },
          { status: 404 }
        );
      }

      // Check if already scanned
      if (qrCodeEntry.scanned) {
        return NextResponse.json(
          {
            success: false,
            error: `${qrCodeType.toUpperCase()} QR code already scanned`,
            alreadyScanned: true,
            ticket: {
              id: qrCodeEntry.ticketId,
              qrCodeType: qrCodeEntry.qrCodeType,
              scannedAt: qrCodeEntry.scannedAt,
              attendee: {
                name: booking.userName,
                email: booking.userEmail,
                phone: booking.userPhone,
              },
            },
          },
          { status: 400 }
        );
      }

      // Mark as scanned
      qrCodeEntry.scanned = true
      qrCodeEntry.scannedAt = new Date()
      await booking.save()

      // Get all QR codes for this ticket to show status
      const ticketQRCodes = booking.tickets.filter(
        (t: any) => t.ticketId === qrCodeEntry.ticketId
      )

      return NextResponse.json({
        success: true,
        message: `${qrCodeType.toUpperCase()} QR code validated successfully`,
        ticket: {
          id: qrCodeEntry.ticketId,
          qrCodeType: qrCodeEntry.qrCodeType,
          ticketType: booking.ticketType,
          price: booking.pricePerTicket,
          scannedAt: qrCodeEntry.scannedAt,
          attendee: {
            name: booking.userName,
            email: booking.userEmail,
            phone: booking.userPhone,
          },
          event: {
            title: event.title,
            date: event.date,
            time: event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : event.time,
            location: event.location,
          },
          allQRCodes: ticketQRCodes.map((qr: any) => ({
            type: qr.qrCodeType,
            scanned: qr.scanned,
            scannedAt: qr.scannedAt,
          })),
        },
      });
    }

    // Old format validation (legacy Ticket model)

    // Validate and parse QR code
    const parsedData = validateAndParseQR(qrData, qrSignature);
    if (!parsedData) {
      return NextResponse.json(
        { error: "Invalid or tampered QR code" },
        { status: 400 }
      );
    }

    // Find ticket
    const ticket = await Ticket.findOne({
      qrData,
      qrSignature,
    }).populate("eventId");

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Get event details
    const event = await Event.findById(ticket.eventId);
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if user is the organizer or admin
    const isOrganizer = event.organizerId.toString() === session.user.id;
    const isAdmin = session.user.role === "SUPER_ADMIN";

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "Only the event organizer or admin can scan tickets" },
        { status: 403 }
      );
    }

    // Check if ticket belongs to the correct event
    const isCorrectEvent = ticket.eventId._id.toString() === eventId;

    if (!isCorrectEvent) {
      // Mark ticket as WRONG_EVENT (only if currently ACTIVE)
      if (ticket.status === "ACTIVE") {
        await Ticket.findByIdAndUpdate(ticket._id, {
          status: "WRONG_EVENT",
          $push: {
            scanHistory: {
              scannedAt: new Date(),
              scannedBy: session.user.id,
              scannedEventId: eventId,
              scannedEventTitle: event.title,
              isValidEvent: false,
            },
          },
        });
      } else {
        // Just log the wrong event scan in history without changing status
        await Ticket.findByIdAndUpdate(ticket._id, {
          $push: {
            scanHistory: {
              scannedAt: new Date(),
              scannedBy: session.user.id,
              scannedEventId: eventId,
              scannedEventTitle: event.title,
              isValidEvent: false,
            },
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: `Wrong event! This ticket is for "${ticket.eventTitle}"`,
          wrongEvent: true,
          ticket: {
            id: ticket._id,
            status: ticket.status,
            ticketType: ticket.ticketType,
            price: ticket.price,
            attendee: {
              name: ticket.userName,
              email: ticket.userEmail,
            },
            correctEvent: {
              title: ticket.eventTitle,
              date: ticket.eventDate,
              location: ticket.eventLocation,
            },
            scannedEvent: {
              title: event.title,
            },
          },
        },
        { status: 400 }
      );
    }

    // Check if ticket is already scanned (at the correct event)
    if (ticket.status === "SCANNED") {
      return NextResponse.json(
        {
          success: false,
          error: "Ticket already scanned",
          alreadyScanned: true,
          ticket: {
            id: ticket._id,
            status: ticket.status,
            scannedAt: ticket.scannedAt,
            ticketType: ticket.ticketType,
            price: ticket.price,
            attendee: {
              name: ticket.userName,
              email: ticket.userEmail,
            },
          },
        },
        { status: 400 }
      );
    }

    // Check if ticket was previously scanned at wrong event but now at correct event
    if (ticket.status === "WRONG_EVENT") {
      // Allow scanning at correct event - this will change status to SCANNED
      // Continue to the validation below
    }

    // Check if ticket is expired
    if (ticket.status === "EXPIRED") {
      return NextResponse.json(
        {
          success: false,
          error: "Ticket has expired",
          ticket: {
            id: ticket._id,
            status: ticket.status,
            attendee: {
              name: ticket.userName,
              email: ticket.userEmail,
            },
          },
        },
        { status: 400 }
      );
    }

    // Check if event date has passed (auto-expire)
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      // Mark ticket as expired
      await Ticket.findByIdAndUpdate(ticket._id, {
        status: "EXPIRED",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Event has finished, ticket expired",
          ticket: {
            id: ticket._id,
            status: "EXPIRED",
            attendee: {
              name: ticket.userName,
              email: ticket.userEmail,
            },
          },
        },
        { status: 400 }
      );
    }

    // Update ticket status to SCANNED (works for ACTIVE or WRONG_EVENT status)
    const wasWrongEvent = ticket.status === "WRONG_EVENT";
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      {
        status: "SCANNED",
        scannedAt: new Date(),
        $push: {
          scanHistory: {
            scannedAt: new Date(),
            scannedBy: session.user.id,
            scannedEventId: eventId,
            scannedEventTitle: event.title,
            isValidEvent: true,
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: wasWrongEvent 
        ? "Ticket validated successfully (previously scanned at wrong event)" 
        : "Ticket validated successfully",
      wasWrongEvent,
      ticket: {
        id: updatedTicket._id,
        status: updatedTicket.status,
        ticketType: updatedTicket.ticketType,
        price: updatedTicket.price,
        purchaseDate: updatedTicket.purchaseDate,
        scannedAt: updatedTicket.scannedAt,
        attendee: {
          name: updatedTicket.userName,
          email: updatedTicket.userEmail,
        },
        event: {
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
        },
      },
    });
  } catch (error) {
    console.error("Ticket validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate ticket" },
      { status: 500 }
    );
  }
}
