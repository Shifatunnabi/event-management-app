import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Ticket from "@/lib/db/models/Ticket";
import Event from "@/lib/db/models/Event";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    // Build query
    const query: any = {
      userId: session.user.id,
    };

    if (eventId) {
      query.eventId = eventId;
    }

    // Fetch tickets
    const tickets = await Ticket.find(query)
      .populate("eventId", "title date time location locationLink organizerName image ticketPrice")
      .sort({ purchaseDate: -1 });

    // Group tickets by event
    const groupedTickets = tickets.reduce((acc, ticket) => {
      const eventIdStr = ticket.eventId._id.toString();

      if (!acc[eventIdStr]) {
        acc[eventIdStr] = {
          event: {
            id: ticket.eventId._id,
            title: ticket.eventTitle,
            date: ticket.eventDate,
            time: ticket.eventId.time,
            location: ticket.eventLocation,
            locationLink: ticket.eventId.locationLink,
            organizerName: ticket.eventId.organizerName,
            image: ticket.eventImage,
            ticketPrice: ticket.eventId.ticketPrice,
          },
          tickets: [],
          totalTickets: 0,
          totalAmount: 0,
          scannedCount: 0,
          activeCount: 0,
          expiredCount: 0,
        };
      }

      acc[eventIdStr].tickets.push({
        id: ticket._id,
        qrData: ticket.qrData,
        qrSignature: ticket.qrSignature,
        status: ticket.status,
        price: ticket.price,
        purchaseDate: ticket.purchaseDate,
        scannedAt: ticket.scannedAt,
        emailSent: ticket.emailSent,
      });

      acc[eventIdStr].totalTickets++;
      acc[eventIdStr].totalAmount += ticket.price;

      if (ticket.status === "SCANNED") {
        acc[eventIdStr].scannedCount++;
      } else if (ticket.status === "ACTIVE") {
        acc[eventIdStr].activeCount++;
      } else if (ticket.status === "EXPIRED") {
        acc[eventIdStr].expiredCount++;
      }

      return acc;
    }, {} as Record<string, any>);

    // Convert to array
    const ticketGroups = Object.values(groupedTickets);

    return NextResponse.json({
      success: true,
      totalEvents: ticketGroups.length,
      totalTickets: tickets.length,
      ticketGroups,
    });
  } catch (error) {
    console.error("Get user tickets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
