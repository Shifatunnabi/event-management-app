import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    // Try to find by slug first, then by ID if slug fails
    let event: any = await Event.findOne({ slug: id })
      .select("-interested -going")
      .lean()

    if (!event) {
      // Fallback to ID for backward compatibility
      event = await Event.findById(id)
        .select("-interested -going")
        .lean()
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Transform event to match frontend interface
    const transformedEvent = {
      id: event._id.toString(),
      slug: event.slug,
      title: event.title,
      description: event.description,
      image: event.image,
      date: event.date.toISOString().split("T")[0],
      time: event.time,
      location: event.location,
      locationLink: event.locationLink,
      category: event.category,
      organizer: event.organizerName,
      organizationName: event.organizationName,
      organizerId: event.organizerId.toString(),
      price: event.ticketType === "FREE" ? "Free" : event.ticketPrice || 0,
      ticketType: event.ticketType,
      hasTicketLimit: event.hasTicketLimit,
      totalTickets: event.totalTickets,
      ticketsSold: event.ticketsSold,
      attendees: event.attendees,
      isFeatured: event.isFeatured,
      status: event.status,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
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
