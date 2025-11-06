import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

// GET - Get all pending organizer requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Check if user is authenticated and is super admin
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get all pending organizers
    const pendingOrganizers = await User.find({
      role: "ORGANIZER",
      organizerStatus: "PENDING",
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean()

    // Get all approved organizers
    const approvedOrganizers = await User.find({
      role: "ORGANIZER",
      organizerStatus: "APPROVED",
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean()

    // Get statistics
    const totalOrganizers = await User.countDocuments({
      role: "ORGANIZER",
      organizerStatus: "APPROVED",
    })

    const pendingCount = await User.countDocuments({
      role: "ORGANIZER",
      organizerStatus: "PENDING",
    })

    return NextResponse.json({
      pending: pendingOrganizers,
      approved: approvedOrganizers,
      stats: {
        totalOrganizers,
        pendingCount,
      },
    })
  } catch (error: any) {
    console.error("Error fetching organizers:", error)
    return NextResponse.json(
      { error: "Failed to fetch organizers" },
      { status: 500 }
    )
  }
}
