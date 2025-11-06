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

    const event = await Event.findById(id)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if event is free
    if (event.ticketType !== "FREE") {
      return NextResponse.json(
        { error: "This action is only available for free events" },
        { status: 400 }
      )
    }

    const userId = user._id

    if (action === "interested") {
      // Toggle interested
      const isAlreadyInterested = event.interested.some(
        (id: any) => id.toString() === userId.toString()
      )

      if (isAlreadyInterested) {
        // Remove from interested
        event.interested = event.interested.filter(
          (id: any) => id.toString() !== userId.toString()
        )
      } else {
        // Add to interested and remove from going if present
        event.interested.push(userId)
        event.going = event.going.filter(
          (id: any) => id.toString() !== userId.toString()
        )
      }
    } else if (action === "going") {
      // Toggle going
      const isAlreadyGoing = event.going.some(
        (id: any) => id.toString() === userId.toString()
      )

      if (isAlreadyGoing) {
        // Remove from going
        event.going = event.going.filter(
          (id: any) => id.toString() !== userId.toString()
        )
      } else {
        // Add to going and remove from interested if present
        event.going.push(userId)
        event.interested = event.interested.filter(
          (id: any) => id.toString() !== userId.toString()
        )
      }
    }

    await event.save()

    return NextResponse.json({
      success: true,
      message: `Successfully ${action === "interested" ? "marked interested" : "marked going"}`,
      interested: event.interested.length,
      going: event.going.length,
    })
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
    const event = await Event.findById(id).select("interested going ticketType")

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const userId = user?._id.toString()

    return NextResponse.json({
      isInterested: userId
        ? event.interested.some((id: any) => id.toString() === userId)
        : false,
      isGoing: userId ? event.going.some((id: any) => id.toString() === userId) : false,
      interestedCount: event.interested.length,
      goingCount: event.going.length,
      ticketType: event.ticketType,
    })
  } catch (error) {
    console.error("Error fetching interest status:", error)
    return NextResponse.json(
      { error: "Failed to fetch interest status" },
      { status: 500 }
    )
  }
}
