import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import Event from "@/lib/db/models/Event"
import User from "@/lib/db/models/User"
import Vendor from "@/lib/db/models/Vendor"
import Job from "@/lib/db/models/Job"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admins can access dashboard stats" },
        { status: 403 }
      )
    }

    // Get today's date at midnight for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 1. Total Events (all events from all organizers)
    const totalEvents = await Event.countDocuments()

    // 2. Total Approved Organizers (users with role ORGANIZER and status APPROVED)
    const totalOrganizers = await User.countDocuments({
      role: "ORGANIZER",
      organizerStatus: "APPROVED"
    })

    // 3. Pending Organizer Approvals (users with role ORGANIZER and status PENDING)
    const pendingOrganizerApprovals = await User.countDocuments({
      role: "ORGANIZER",
      organizerStatus: "PENDING"
    })

    // 4. Past Events (events with date < today)
    const pastEvents = await Event.countDocuments({
      date: { $lt: today }
    })

    // 5. Total Approved Vendors (from Vendor model)
    const totalVendors = await Vendor.countDocuments({
      approvalStatus: "APPROVED"
    })

    // 6. Vendor Applications (pending vendors from Vendor model)
    const vendorApplications = await Vendor.countDocuments({
      approvalStatus: "PENDING"
    })

    // 7. Upcoming Events (events with date >= today)
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: today }
    })

    // 8. Total Jobs Posted
    const totalJobs = await Job.countDocuments()

    const statsData = {
      totalEvents,
      totalOrganizers,
      pendingOrganizerApprovals,
      pastEvents,
      totalVendors,
      vendorApplications,
      upcomingEvents,
      totalJobs
    }

    console.log("Dashboard Stats:", statsData)

    return NextResponse.json({
      success: true,
      stats: statsData
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
