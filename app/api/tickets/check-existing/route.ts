import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import TicketBooking from "@/lib/db/models/TicketBooking"
import User from "@/lib/db/models/User"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const eventSlug = searchParams.get("eventSlug")

    if (!eventSlug) {
      return NextResponse.json(
        { error: "Event slug is required" },
        { status: 400 }
      )
    }

    // Check if user has any active bookings for this event
    const existingBooking = await TicketBooking.findOne({
      userId: user._id,
      eventSlug,
      status: { $in: ["RESERVED", "PENDING", "CONFIRMED"] },
    })

    return NextResponse.json({
      hasExistingBooking: !!existingBooking,
      booking: existingBooking
        ? {
            id: existingBooking._id.toString(),
            status: existingBooking.status,
            numberOfTickets: existingBooking.numberOfTickets,
            totalAmount: existingBooking.totalAmount,
          }
        : null,
    })
  } catch (error: any) {
    console.error("Error checking existing booking:", error)
    return NextResponse.json(
      { error: error.message || "Failed to check booking status" },
      { status: 500 }
    )
  }
}
