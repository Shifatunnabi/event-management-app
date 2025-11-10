import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Ticket from "@/lib/db/models/Ticket";
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

    // If eventId is provided, verify it matches
    if (eventId && ticket.eventId._id.toString() !== eventId) {
      return NextResponse.json(
        { error: "Ticket does not belong to this event" },
        { status: 400 }
      );
    }

    // Check if ticket is already scanned
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
            attendee: {
              name: ticket.userName,
              email: ticket.userEmail,
            },
          },
        },
        { status: 400 }
      );
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

    // Update ticket status to SCANNED
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      {
        status: "SCANNED",
        scannedAt: new Date(),
        $push: {
          scanHistory: {
            scannedAt: new Date(),
            scannedBy: session.user.id,
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Ticket validated successfully",
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
