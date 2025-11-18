import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"

// GET - Fetch event by ID
export async function GET(
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
        { error: "Only approved organizers can view events" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Find event and check ownership
    const event = await Event.findById(id).lean()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.organizerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You can only view your own events" },
        { status: 403 }
      )
    }

    // Transform event for editing
    const transformedEvent = {
      _id: event._id.toString(),
      title: event.title,
      description: event.description,
      image: event.image,
      date: new Date(event.date).toISOString().split("T")[0],
      time: event.time,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      locationLink: event.locationLink,
      category: event.category,
      ticketType: event.ticketTypes && event.ticketTypes.length > 0 
        ? (event.ticketTypes.every((t: any) => t.price === 0) ? "FREE" : "PREMIUM")
        : "FREE",
      ticketPrice: event.ticketTypes && event.ticketTypes.length > 0 
        ? event.ticketTypes[0].price 
        : 0,
      bkashNumber: event.bkashNumber,
      hasTicketLimit: event.hasCapacityLimit || false,
      totalTickets: event.totalCapacity,
    }

    return NextResponse.json({
      success: true,
      event: transformedEvent,
    })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}

// PATCH - Update event
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
        { error: "Only approved organizers can update events" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

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

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    )
  }
}

// DELETE - Delete event
export async function DELETE(
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
        { error: "Only approved organizers can delete events" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Find event and check ownership
    const event = await Event.findById(id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.organizerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You can only delete your own events" },
        { status: 403 }
      )
    }

    await Event.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    )
  }
}
