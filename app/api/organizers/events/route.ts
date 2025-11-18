import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { generateUniqueSlug } from "@/lib/utils/slug"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get user from database
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is an approved organizer
    if (user.role !== "ORGANIZER" || user.organizerStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved organizers can create events" },
        { status: 403 }
      )
    }

    const formData = await request.formData()

    // Get form fields
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const locationLink = formData.get("locationLink") as string
    const date = formData.get("date") as string
    const startTime = formData.get("startTime") as string
    const endTime = formData.get("endTime") as string
    const category = formData.get("category") as string
    const ticketType = formData.get("ticketType") as "FREE" | "PREMIUM"
    const ticketPrice = formData.get("ticketPrice")
    const bkashNumber = formData.get("bkashNumber") as string
    const hasTicketLimit = formData.get("hasTicketLimit") === "true"
    const totalTickets = formData.get("totalTickets")
    const imageUrl = formData.get("imageUrl") as string

    // Helper function to convert 24-hour time to 12-hour format with AM/PM
    const convertTo12Hour = (time24: string): string => {
      const [hours, minutes] = time24.split(':')
      const hour = parseInt(hours, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    }

    // Convert times to 12-hour format with AM/PM
    const formattedStartTime = startTime ? convertTo12Hour(startTime) : undefined
    const formattedEndTime = endTime ? convertTo12Hour(endTime) : undefined

    // Log received data for debugging
    console.log("Received form data:", {
      title,
      description: description?.substring(0, 50) + "...",
      location,
      locationLink,
      date,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      category,
      ticketType,
      ticketPrice,
      hasTicketLimit,
      totalTickets,
      imageUrl
    })

    // Validate required fields
    if (!title || !description || !location || !date || !startTime || !endTime || !category || !ticketType) {
      const missing = []
      if (!title) missing.push("title")
      if (!description) missing.push("description")
      if (!location) missing.push("location")
      if (!date) missing.push("date")
      if (!startTime) missing.push("startTime")
      if (!endTime) missing.push("endTime")
      if (!category) missing.push("category")
      if (!ticketType) missing.push("ticketType")
      
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate image URL
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Event poster is required" },
        { status: 400 }
      )
    }

    // Validate ticket type specific fields
    if (ticketType === "PREMIUM" && !ticketPrice) {
      return NextResponse.json(
        { error: "Ticket price is required for premium events" },
        { status: 400 }
      )
    }
    
    if (ticketType === "PREMIUM" && !bkashNumber) {
      return NextResponse.json(
        { error: "Bkash number is required for premium events" },
        { status: 400 }
      )
    }

    if (hasTicketLimit && !totalTickets) {
      return NextResponse.json(
        { error: "Total tickets is required when ticket limit is enabled" },
        { status: 400 }
      )
    }

    // Create ticket types array
    const ticketTypes = []
    
    if (ticketType === "FREE") {
      ticketTypes.push({
        name: "Free Ticket",
        price: 0,
        hasLimit: hasTicketLimit,
        quantity: hasTicketLimit && totalTickets ? parseInt(totalTickets as string, 10) : null,
        sold: 0,
        available: hasTicketLimit && totalTickets ? parseInt(totalTickets as string, 10) : null,
      })
    } else if (ticketType === "PREMIUM" && ticketPrice) {
      ticketTypes.push({
        name: "Premium Ticket",
        price: parseFloat(ticketPrice as string),
        hasLimit: hasTicketLimit,
        quantity: hasTicketLimit && totalTickets ? parseInt(totalTickets as string, 10) : null,
        sold: 0,
        available: hasTicketLimit && totalTickets ? parseInt(totalTickets as string, 10) : null,
      })
    }

    // Generate unique slug for the event
    const slug = generateUniqueSlug(title)

    // Create event
    const eventData: any = {
      title,
      slug,
      description,
      image: imageUrl,
      date: new Date(date),
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      location,
      locationLink: locationLink || undefined,
      category,
      organizerId: user._id,
      organizerName: user.name,
      organizationName: user.organizationName || undefined,
      hasCapacityLimit: hasTicketLimit,
      totalCapacity: hasTicketLimit && totalTickets ? parseInt(totalTickets as string, 10) : null,
      ticketsSold: 0,
      ticketTypes,
      bkashNumber: ticketType === "PREMIUM" ? bkashNumber : undefined,
      status: "PUBLISHED",
      isFeatured: false,
      attendees: 0,
      publishedAt: new Date(),
    }

    console.log("Creating event with data:", JSON.stringify(eventData, null, 2))

    const event = await Event.create(eventData)
    
    console.log("Event created successfully:", event._id)

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating event:", error)
    
    // Return detailed error message
    const errorMessage = error instanceof Error ? error.message : "Failed to create event"
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined 
      },
      { status: 500 }
    )
  }
}

// GET - Get organizer's events
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

    if (user.role !== "ORGANIZER" || user.organizerStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved organizers can view their events" },
        { status: 403 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const filter: any = { organizerId: user._id }
    if (status) {
      filter.status = status
    }

    const events = await Event.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean()

    // Transform events to include attendees count
    const transformedEvents = events.map((event: any) => ({
      _id: event._id,
      title: event.title,
      slug: event.slug,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      time: event.time, // Keep for backward compatibility
      status: event.status,
      ticketsSold: event.ticketsSold || 0,
      attendees: event.ticketsSold || 0,
    }))

    return NextResponse.json({
      success: true,
      events: transformedEvents,
    })
  } catch (error) {
    console.error("Error fetching organizer events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}
