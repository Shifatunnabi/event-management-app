import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"

// GET - Get all events (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can access this resource" },
        { status: 403 }
      )
    }

    // Get query parameters for search
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const organizerName = searchParams.get("organizerName")

    const filter: any = {}

    // If organizerName is provided, filter by organizer name
    if (organizerName) {
      filter.organizerName = { $regex: organizerName, $options: "i" }
    }
    // Otherwise, apply general search filter
    else if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { organizerName: { $regex: search, $options: "i" } },
        { organizationName: { $regex: search, $options: "i" } },
      ]
    }

    const events = await Event.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean()

    // Transform events to include attendees count and other details
    const transformedEvents = events.map((event: any) => {
      // Determine ticket type based on ticket prices
      const ticketTypes = event.ticketTypes || []
      let ticketType = "FREE"
      
      if (ticketTypes.length > 0) {
        const allFree = ticketTypes.every((t: any) => t.price === 0)
        ticketType = allFree ? "FREE" : "PREMIUM"
      }
      
      return {
        _id: event._id,
        title: event.title,
        slug: event.slug,
        date: event.date,
        time: event.time,
        ticketType: ticketType,
        organizerName: event.organizerName,
        organizationName: event.organizationName,
        status: event.status,
        category: event.category,
        location: event.location,
        attendees: event.ticketsSold || 0,
      }
    })

    return NextResponse.json({
      success: true,
      events: transformedEvents,
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}
