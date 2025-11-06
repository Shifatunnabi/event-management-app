import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import Event from "@/lib/db/models/Event"

// GET - Get approved organizers with their event counts
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Check if user is authenticated and is super admin
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get all approved organizers
    const approvedOrganizers = await User.find({
      role: "ORGANIZER",
      organizerStatus: "APPROVED",
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean()

    // Get event counts for each organizer
    const organizersWithStats = await Promise.all(
      approvedOrganizers.map(async (organizer: any) => {
        const eventCount = await Event.countDocuments({
          organizerId: organizer._id,
          status: { $ne: "CANCELLED" },
        })

        return {
          id: organizer._id.toString(),
          name: organizer.name,
          email: organizer.email,
          phone: organizer.phone,
          address: organizer.address,
          organizationName: organizer.organizationName,
          nidNumber: organizer.nidNumber,
          joinDate: organizer.createdAt,
          eventCount,
        }
      })
    )

    // Get statistics
    const totalOrganizers = approvedOrganizers.length
    const pendingCount = await User.countDocuments({
      role: "ORGANIZER",
      organizerStatus: "PENDING",
    })
    const totalEvents = await Event.countDocuments({
      status: { $ne: "CANCELLED" },
    })

    return NextResponse.json({
      organizers: organizersWithStats,
      stats: {
        totalOrganizers,
        pendingRequests: pendingCount,
        totalEvents,
      },
    })
  } catch (error: any) {
    console.error("Error fetching organizer management data:", error)
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}
