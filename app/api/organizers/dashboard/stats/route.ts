import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"
import TicketBooking from "@/lib/db/models/TicketBooking"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user || user.role !== "ORGANIZER" || user.organizerStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved organizers can access dashboard stats" },
        { status: 403 }
      )
    }

    // Get today's date at midnight for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 1. Total Listed Events (all events by this organizer)
    const totalListedEvents = await Event.countDocuments({
      organizerId: user._id
    })

    // 2. Total Active Events (upcoming events)
    const totalActiveEvents = await Event.countDocuments({
      organizerId: user._id,
      date: { $gte: today }
    })

    // 3. Total Ticket Sales (sum of all tickets sold)
    const events = await Event.find({ organizerId: user._id }).lean()
    const totalTicketSales = events.reduce((sum, event) => sum + (event.ticketsSold || 0), 0)

    // 4. Total Attendees (sum of all attendees from all events)
    const totalAttendees = events.reduce((sum, event) => sum + (event.attendees || 0), 0)

    // 5. Total Revenue (calculate from CONFIRMED ticket bookings)
    const eventIds = events.map(event => event._id)
    const bookings = await TicketBooking.find({ 
      eventId: { $in: eventIds },
      status: "CONFIRMED"
    }).lean()
    
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (booking.totalAmount || 0)
    }, 0)

    // 6. Join Date (user's createdAt date)
    const joinDate = user.createdAt

    // Get upcoming events with details
    const upcomingEvents = await Event.find({
      organizerId: user._id,
      date: { $gte: today }
    })
    .sort({ date: 1 })
    .limit(5)
    .select('title date attendees')
    .lean()

    const statsData = {
      totalListedEvents,
      totalActiveEvents,
      totalTicketSales,
      totalAttendees,
      totalRevenue,
      joinDate,
      upcomingEvents: upcomingEvents.map(event => ({
        title: event.title,
        date: event.date,
        attendees: event.attendees || 0
      }))
    }

    console.log("Organizer Dashboard Stats:", statsData)

    return NextResponse.json({
      success: true,
      stats: statsData
    })
  } catch (error) {
    console.error("Error fetching organizer dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
