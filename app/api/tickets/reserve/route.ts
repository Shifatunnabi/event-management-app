import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Event from "@/lib/db/models/Event";
import Reservation from "@/lib/db/models/Reservation";
import { generateSessionId } from "@/lib/utils/qrGenerator";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { eventId, quantity } = await req.json();

    // Validation
    if (!eventId || !quantity) {
      return NextResponse.json(
        { error: "Event ID and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event is premium
    if (event.ticketType !== "PREMIUM") {
      return NextResponse.json(
        { error: "This is not a premium event" },
        { status: 400 }
      );
    }

    // Check if event has ticket limit
    if (!event.hasTicketLimit || !event.totalTickets) {
      return NextResponse.json(
        { error: "Event does not have ticket limits" },
        { status: 400 }
      );
    }

    // Check ticket price
    if (!event.ticketPrice || event.ticketPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid ticket price" },
        { status: 400 }
      );
    }

    // Check if event date has passed
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return NextResponse.json(
        { error: "Event has already finished" },
        { status: 400 }
      );
    }

    // Calculate available tickets
    const availableTickets =
      event.totalTickets - event.ticketsSold - event.reservedTickets;

    if (availableTickets < quantity) {
      return NextResponse.json(
        {
          error: "Not enough tickets available",
          available: availableTickets,
        },
        { status: 400 }
      );
    }

    // Cancel any existing pending reservations for this user and event
    await Reservation.updateMany(
      {
        userId: session.user.id,
        eventId,
        status: "PENDING",
      },
      {
        status: "EXPIRED",
      }
    );

    // Create reservation with 15-minute expiry
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const totalAmount = event.ticketPrice * quantity;

    const reservation = await Reservation.create({
      sessionId,
      userId: session.user.id,
      eventId,
      quantity,
      totalAmount,
      status: "PENDING",
      expiresAt,
    });

    // Update event reserved tickets
    await Event.findByIdAndUpdate(eventId, {
      $inc: { reservedTickets: quantity },
    });

    return NextResponse.json(
      {
        success: true,
        sessionId: reservation.sessionId,
        expiresAt: reservation.expiresAt,
        totalAmount: reservation.totalAmount,
        quantity: reservation.quantity,
        event: {
          id: event._id,
          title: event.title,
          image: event.image,
          date: event.date,
          time: event.time,
          location: event.location,
          ticketPrice: event.ticketPrice,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Reservation error:", error);
    return NextResponse.json(
      { error: "Failed to reserve tickets" },
      { status: 500 }
    );
  }
}
