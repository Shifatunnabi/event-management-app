import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"

// POST - Mark interested or going for a free event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const { action } = await request.json()

    if (!action || !["interested", "going"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'interested' or 'going'" },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const event: any = await Event.findById(id)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if event is free (all ticket types have price 0 or no tickets)
    const ticketTypes = event.ticketTypes || []
    const isFree = ticketTypes.length === 0 || ticketTypes.every((t: any) => t.price === 0)
    
    if (!isFree) {
      return NextResponse.json(
        { error: "This action is only available for free events" },
        { status: 400 }
      )
    }

    // Note: interested/going functionality is deprecated for new events
    // This API is kept for backward compatibility with old events
    return NextResponse.json(
      { error: "Interested/Going functionality is not available. For free events, users can register directly." },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating event interest:", error)
    return NextResponse.json(
      { error: "Failed to update interest" },
      { status: 500 }
    )
  }
}

// GET - Get user's interest status for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({
        isInterested: false,
        isGoing: false,
        interestedCount: 0,
        goingCount: 0,
      })
    }

    await connectDB()

    const { id } = await params

    const user = await User.findOne({ email: session.user.email })
    const event: any = await Event.findById(id).select("ticketTypes")

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Determine ticket type
    const ticketTypes = event.ticketTypes || []
    const isFree = ticketTypes.length === 0 || ticketTypes.every((t: any) => t.price === 0)
    const ticketType = isFree ? "FREE" : "PREMIUM"

    // Note: interested/going functionality is deprecated
    return NextResponse.json({
      isInterested: false,
      isGoing: false,
      interestedCount: 0,
      goingCount: 0,
      ticketType: ticketType,
    })
  } catch (error) {
    console.error("Error fetching interest status:", error)
    return NextResponse.json(
      { error: "Failed to fetch interest status" },
      { status: 500 }
    )
  }
}
