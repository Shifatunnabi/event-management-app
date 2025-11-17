import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()

    const { slug } = await params

    // Find event by slug and populate organizer details
    const event: any = await Event.findOne({ slug, status: { $ne: "HIDDEN" } })
      .select("-interested -going")
      .populate("organizerId", "email phone")
      .lean()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Extract organizer details
    const organizerEmail = event.organizerId?.email || ""
    const organizerPhone = event.organizerId?.phone || ""

    // Determine ticket type based on ticket prices
    const ticketTypes = event.ticketTypes || []
    
    // If no ticket types, it's a free event
    if (ticketTypes.length === 0) {
      const ticketType = "FREE"
      const minPrice = 0
      
      const transformedEvent = {
        id: event._id.toString(),
        slug: event.slug,
        title: event.title,
        description: event.description,
        image: event.image,
        date: event.date.toISOString().split("T")[0],
        time: event.time,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        locationLink: event.locationLink,
        category: event.category,
        organizer: event.organizerName,
        organizationName: event.organizationName,
        organizerEmail: organizerEmail,
        organizerPhone: organizerPhone,
        organizerId: typeof event.organizerId === 'object' ? event.organizerId._id.toString() : event.organizerId.toString(),
        price: "Free",
        ticketType: ticketType,
        ticketTypes: [],
        bkashNumber: event.bkashNumber,
        hasTicketLimit: event.hasCapacityLimit,
        totalTickets: event.totalCapacity,
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
    }
    
    // Determine if all tickets are free
    const minPrice = Math.min(...ticketTypes.map((t: any) => t.price))
    const allFree = ticketTypes.every((t: any) => t.price === 0)
    const ticketType = allFree ? "FREE" : "PREMIUM"
    
    // Transform event to match frontend interface
    const transformedEvent = {
      id: event._id.toString(),
      slug: event.slug,
      title: event.title,
      description: event.description,
      image: event.image,
      date: event.date.toISOString().split("T")[0],
      time: event.time,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      locationLink: event.locationLink,
      category: event.category,
      organizer: event.organizerName,
      organizationName: event.organizationName,
      organizerEmail: organizerEmail,
      organizerPhone: organizerPhone,
      organizerId: typeof event.organizerId === 'object' ? event.organizerId._id.toString() : event.organizerId.toString(),
      price: minPrice === 0 ? "Free" : minPrice,
      ticketType: ticketType,
      ticketTypes: ticketTypes,
      bkashNumber: event.bkashNumber,
      hasTicketLimit: event.hasCapacityLimit,
      totalTickets: event.totalCapacity,
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
