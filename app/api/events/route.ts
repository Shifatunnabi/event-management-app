import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"

// GET - Get all published events
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const upcoming = searchParams.get("upcoming")

    // Build filter
    const filter: any = { status: "PUBLISHED" }

    if (category && category !== "all") {
      filter.category = category
    }

    if (search) {
      filter.$text = { $search: search }
    }

    // Filter upcoming events (future dates only)
    if (upcoming === "true") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filter.date = { $gte: today }
    }

    let query = Event.find(filter)
      .select("-interested -going")
      .sort({ date: 1, createdAt: -1 })
      .lean()

    if (limit) {
      query = query.limit(parseInt(limit, 10))
    }

    const events = await query

    // Transform events to match frontend interface
    const transformedEvents = events.map((event: any) => ({
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
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      events: transformedEvents,
      count: transformedEvents.length,
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}
