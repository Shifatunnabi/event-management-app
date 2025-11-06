import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

// POST - Decline/Reject an organizer
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Check if user is authenticated and is super admin
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { organizerId } = await request.json()

    if (!organizerId) {
      return NextResponse.json(
        { error: "Organizer ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

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

    // Reject the organizer
    organizer.organizerStatus = "REJECTED"
    await organizer.save()

    return NextResponse.json({
      success: true,
      message: "Organizer request declined",
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
      },
    })
  } catch (error: any) {
    console.error("Error declining organizer:", error)
    return NextResponse.json(
      { error: "Failed to decline organizer" },
      { status: 500 }
    )
  }
}
