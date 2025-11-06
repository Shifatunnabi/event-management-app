import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"

// PATCH - Update event status (hide/show)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user || user.role !== "ORGANIZER" || user.organizerStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved organizers can update event status" },
        { status: 403 }
      )
    }

    const { id } = await params
    const { status } = await request.json()

    if (!["PUBLISHED", "HIDDEN"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be PUBLISHED or HIDDEN" },
        { status: 400 }
      )
    }

    // Find event and check ownership
    const event = await Event.findById(id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.organizerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You can only update your own events" },
        { status: 403 }
      )
    }

    // Update status
    event.status = status
    await event.save()

    return NextResponse.json({
      success: true,
      message: `Event ${status === "HIDDEN" ? "hidden" : "published"} successfully`,
      event: {
        id: event._id,
        status: event.status,
      },
    })
  } catch (error) {
    console.error("Error updating event status:", error)
    return NextResponse.json(
      { error: "Failed to update event status" },
      { status: 500 }
    )
  }
}
