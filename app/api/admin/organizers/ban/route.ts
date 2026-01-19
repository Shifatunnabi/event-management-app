import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

// POST - Ban or unban an organizer
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth()

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { organizerId, isBanned } = await request.json()

    if (!organizerId || typeof isBanned !== "boolean") {
      return NextResponse.json(
        { error: "Organizer ID and ban status are required" },
        { status: 400 }
      )
    }

    // Find and update the organizer
    const organizer = await User.findById(organizerId)

    if (!organizer) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 })
    }

    if (organizer.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "User is not an organizer" },
        { status: 400 }
      )
    }

    // Update ban status
    organizer.isBanned = isBanned
    await organizer.save()

    return NextResponse.json(
      {
        success: true,
        message: isBanned
          ? "Organizer has been banned successfully"
          : "Organizer has been unbanned successfully",
        organizer: {
          id: organizer._id,
          name: organizer.name,
          isBanned: organizer.isBanned,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error updating organizer ban status:", error)
    return NextResponse.json(
      { error: "Failed to update ban status" },
      { status: 500 }
    )
  }
}
