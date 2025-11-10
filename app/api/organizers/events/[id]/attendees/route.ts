import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Event from "@/lib/db/models/Event";
import Ticket from "@/lib/db/models/Ticket";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    await connectDB();

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user is the organizer or admin
    const isOrganizer = event.organizerId.toString() === session.user.id;
    const isAdmin = session.user.role === "SUPER_ADMIN";

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "Only the event organizer or admin can view attendees" },
        { status: 403 }
      );
    }

    // Fetch all tickets for this event
    const tickets = await Ticket.find({ eventId })
      .sort({ purchaseDate: -1 });

    // Group tickets by user
    const attendeeMap = tickets.reduce((acc, ticket) => {
      const userId = ticket.userId.toString();

      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName: ticket.userName,
          userEmail: ticket.userEmail,
          tickets: [],
          totalTickets: 0,
          scannedTickets: 0,
          activeTickets: 0,
          expiredTickets: 0,
          totalSpent: 0,
          firstPurchase: ticket.purchaseDate,
          emailsSent: 0,
        };
      }

      acc[userId].tickets.push({
        id: ticket._id.toString(),
        status: ticket.status,
        price: ticket.price,
        purchaseDate: ticket.purchaseDate,
        scannedAt: ticket.scannedAt,
        emailSent: ticket.emailSent,
      });

      acc[userId].totalTickets++;
      acc[userId].totalSpent += ticket.price;

      if (ticket.status === "SCANNED") {
        acc[userId].scannedTickets++;
      } else if (ticket.status === "ACTIVE") {
        acc[userId].activeTickets++;
      } else if (ticket.status === "EXPIRED") {
        acc[userId].expiredTickets++;
      }

      if (ticket.emailSent) {
        acc[userId].emailsSent++;
      }

      // Track earliest purchase
      if (new Date(ticket.purchaseDate) < new Date(acc[userId].firstPurchase)) {
        acc[userId].firstPurchase = ticket.purchaseDate;
      }

      return acc;
    }, {} as Record<string, any>);

    // Convert to array
    const attendees = Object.values(attendeeMap);

    // Calculate statistics
    const stats = {
      totalTickets: tickets.length,
      scannedTickets: tickets.filter((t) => t.status === "SCANNED").length,
      activeTickets: tickets.filter((t) => t.status === "ACTIVE").length,
      expiredTickets: tickets.filter((t) => t.status === "EXPIRED").length,
      totalRevenue: tickets.reduce((sum, t) => sum + t.price, 0),
      totalAttendees: attendees.length,
      emailsSent: tickets.filter((t) => t.emailSent).length,
      emailsPending: tickets.filter((t) => !t.emailSent).length,
      averageTicketsPerAttendee:
        attendees.length > 0 ? (tickets.length / attendees.length).toFixed(2) : 0,
      scanRate:
        tickets.length > 0
          ? (
              (tickets.filter((t) => t.status === "SCANNED").length /
                tickets.length) *
              100
            ).toFixed(1)
          : 0,
    };

    return NextResponse.json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        ticketPrice: event.ticketPrice,
        ticketsSold: event.ticketsSold,
        revenue: event.revenue,
      },
      stats,
      attendees,
    });
  } catch (error) {
    console.error("Get attendees error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}
