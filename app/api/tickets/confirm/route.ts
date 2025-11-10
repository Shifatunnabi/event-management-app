import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Event from "@/lib/db/models/Event";
import Reservation from "@/lib/db/models/Reservation";
import Ticket from "@/lib/db/models/Ticket";
import Order from "@/lib/db/models/Order";
import User from "@/lib/db/models/User";
import {
  generateTicketId,
  generateSecureQR,
} from "@/lib/utils/qrGenerator";
import { queueTicketEmail } from "@/lib/queue/emailQueue";

/**
 * Payment Confirmation API - MOCK PAYMENT FOR NOW
 * 
 * NOTE: This currently uses a simplified mock payment flow without MongoDB transactions.
 * MongoDB transactions require a replica set, which is not available in standalone instances.
 * 
 * TODO: When integrating real payment gateway (Stripe, PayPal, etc.):
 * 1. Replace mock payment verification with actual payment gateway webhook
 * 2. Add proper transaction handling if using MongoDB replica set
 * 3. Implement refund logic for failed ticket generation
 * 4. Add payment gateway specific error handling
 */
export async function POST(req: NextRequest) {
  try {
    const authSession = await auth();

    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { sessionId, paymentAmount } = await req.json();

    // Validation
    if (!sessionId || !paymentAmount) {
      return NextResponse.json(
        { error: "Session ID and payment amount are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find reservation
    const reservation = await Reservation.findOne({
      sessionId,
      userId: authSession.user.id,
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check if reservation is still valid
    if (reservation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Reservation is no longer valid" },
        { status: 400 }
      );
    }

    if (new Date() > reservation.expiresAt) {
      // Update reservation status
      await Reservation.findByIdAndUpdate(
        reservation._id,
        { status: "EXPIRED" }
      );

      return NextResponse.json(
        { error: "Reservation has expired" },
        { status: 400 }
      );
    }

    // Verify payment amount (mock payment for now)
    if (Math.abs(paymentAmount - reservation.totalAmount) > 0.01) {
      return NextResponse.json(
        { error: "Payment amount does not match reservation total" },
        { status: 400 }
      );
    }

    // Get event details
    const event = await Event.findById(reservation.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get user details
    const user = await User.findById(authSession.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create order (mock payment for now - will integrate payment gateway later)
    const order = await Order.create([
      {
        userId: authSession.user.id,
        userName: user.name,
        userEmail: user.email,
        eventId: event._id,
        eventTitle: event.title,
        items: [
          {
            ticketType: event.ticketType,
            price: event.ticketPrice || 0,
            quantity: reservation.quantity,
            subtotal: reservation.totalAmount,
          },
        ],
        totalAmount: reservation.totalAmount,
        paymentStatus: "PAID",
        paymentGateway: "MOCK",
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        paidAt: new Date(),
      },
    ]);

    // Generate tickets
    const tickets = [];
    for (let i = 0; i < reservation.quantity; i++) {
      const ticketId = generateTicketId();
      const { qrData, qrSignature } = generateSecureQR(
        ticketId,
        event._id.toString(),
        authSession.user.id
      );

      const ticket = await Ticket.create([
        {
          eventId: event._id,
          eventTitle: event.title,
          eventImage: event.image,
          eventDate: event.date,
          eventLocation: event.location,
          userId: authSession.user.id,
          userName: user.name,
          userEmail: user.email,
          orderId: order[0]._id,
          ticketType: event.ticketType,
          price: event.ticketPrice || 0,
          qrData,
          qrSignature,
          status: "ACTIVE",
          emailSent: false,
          purchaseDate: new Date(),
        },
      ]);

      tickets.push(ticket[0]);
    }

    // Update event statistics
    await Event.findByIdAndUpdate(event._id, {
      $inc: {
        ticketsSold: reservation.quantity,
        revenue: reservation.totalAmount,
        reservedTickets: -reservation.quantity, // Release reserved tickets
      },
    });

    // Update reservation status
    await Reservation.findByIdAndUpdate(reservation._id, {
      status: "CONFIRMED",
    });

    // Queue email (async, outside transaction)
    try {
      await queueTicketEmail(
        authSession.user.id,
        user.email,
        user.name,
        tickets.map((t) => ({
          _id: t._id.toString(),
          qrData: t.qrData,
          qrSignature: t.qrSignature,
          price: t.price,
        })),
        {
          title: event.title,
          date: event.date.toISOString(),
          time: event.time,
          location: event.location,
          locationLink: event.locationLink,
          organizerName: event.organizerName,
          image: event.image,
        }
      );
    } catch (emailError) {
      console.error("Failed to queue email:", emailError);
      // Don't fail the ticket purchase if email queueing fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tickets purchased successfully",
        orderId: order[0]._id,
        tickets: tickets.map((t) => ({
          id: t._id,
          qrData: t.qrData,
          qrSignature: t.qrSignature,
          ticketType: t.ticketType,
          price: t.price,
          status: t.status,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
