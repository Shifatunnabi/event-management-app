import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import TicketBooking from "@/lib/db/models/TicketBooking"

// POST - Submit payment details (updates RESERVED to PENDING)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { reservationId, senderBkashNumber, transactionId } = body

    // Validate required fields
    if (!reservationId || !senderBkashNumber || !transactionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate Bkash number format
    const bkashRegex = /^01[0-9]{9}$/
    if (!bkashRegex.test(senderBkashNumber)) {
      return NextResponse.json(
        { error: "Invalid Bkash number format. Use: 01XXXXXXXXX" },
        { status: 400 }
      )
    }

    // Find the reservation
    const booking = await TicketBooking.findById(reservationId)

    if (!booking) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Check if booking belongs to user
    if (booking.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized access to this reservation" },
        { status: 403 }
      )
    }

    // Check if reservation is still valid
    if (booking.status !== "RESERVED") {
      return NextResponse.json(
        { error: `Reservation is ${booking.status}. Cannot submit payment.` },
        { status: 400 }
      )
    }

    // Check if reservation has expired
    if (new Date() > new Date(booking.expiresAt)) {
      booking.status = "EXPIRED"
      await booking.save()
      return NextResponse.json(
        { error: "Reservation has expired. Please book again." },
        { status: 400 }
      )
    }

    // Check if transaction ID is already used
    const existingBooking = await TicketBooking.findOne({
      transactionId: transactionId.trim(),
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: "Transaction ID already used. Each transaction ID can only be used once." },
        { status: 400 }
      )
    }

    // Update booking with payment details
    booking.senderBkashNumber = senderBkashNumber.trim()
    booking.transactionId = transactionId.trim()
    booking.status = "PENDING"
    booking.paymentSubmittedAt = new Date()

    await booking.save()

    return NextResponse.json(
      {
        success: true,
        message: "Payment details submitted successfully",
        bookingId: booking._id.toString(),
        status: "PENDING",
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error submitting payment:", error)
    
    // Handle duplicate transaction ID error from unique index
    if (error.code === 11000 && error.keyPattern?.transactionId) {
      return NextResponse.json(
        { error: "Transaction ID already used. Each transaction ID can only be used once." },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to submit payment details" },
      { status: 500 }
    )
  }
}
