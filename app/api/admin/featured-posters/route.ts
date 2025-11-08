import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import FeaturedPoster from "@/lib/db/models/FeaturedPoster"
import User from "@/lib/db/models/User"

// GET - Get all featured posters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("activeOnly") === "true"

    await connectDB()

    const filter = activeOnly ? { active: true } : {}
    const posters = await FeaturedPoster.find(filter)
      .sort({ uploadedAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      posters,
    })
  } catch (error) {
    console.error("Error fetching featured posters:", error)
    return NextResponse.json(
      { error: "Failed to fetch featured posters" },
      { status: 500 }
    )
  }
}

// POST - Create new featured poster (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can create featured posters" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { eventName, eventLink, posterUrl } = body

    // Validate required fields
    if (!eventName || !eventLink || !posterUrl) {
      return NextResponse.json(
        { error: "Event name, event link, and poster URL are required" },
        { status: 400 }
      )
    }

    // Create featured poster
    const poster = await FeaturedPoster.create({
      eventName,
      eventLink,
      posterUrl,
      active: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Featured poster created successfully",
        poster,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating featured poster:", error)
    return NextResponse.json(
      { error: "Failed to create featured poster" },
      { status: 500 }
    )
  }
}

// PATCH - Update featured poster status (activate/deactivate)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can update featured posters" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { posterId, active } = body

    if (!posterId || typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Poster ID and active status are required" },
        { status: 400 }
      )
    }

    const poster = await FeaturedPoster.findByIdAndUpdate(
      posterId,
      { active },
      { new: true }
    )

    if (!poster) {
      return NextResponse.json(
        { error: "Poster not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Poster ${active ? "activated" : "deactivated"} successfully`,
      poster,
    })
  } catch (error) {
    console.error("Error updating featured poster:", error)
    return NextResponse.json(
      { error: "Failed to update featured poster" },
      { status: 500 }
    )
  }
}

// PUT - Update featured poster details
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can update featured posters" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { posterId, eventName, eventLink, posterUrl } = body

    if (!posterId || !eventName || !eventLink || !posterUrl) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const poster = await FeaturedPoster.findByIdAndUpdate(
      posterId,
      { eventName, eventLink, posterUrl },
      { new: true }
    )

    if (!poster) {
      return NextResponse.json(
        { error: "Poster not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Poster updated successfully",
      poster,
    })
  } catch (error) {
    console.error("Error updating featured poster:", error)
    return NextResponse.json(
      { error: "Failed to update featured poster" },
      { status: 500 }
    )
  }
}

// DELETE - Delete featured poster
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can delete featured posters" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const posterId = searchParams.get("posterId")

    if (!posterId) {
      return NextResponse.json(
        { error: "Poster ID is required" },
        { status: 400 }
      )
    }

    const poster = await FeaturedPoster.findByIdAndDelete(posterId)

    if (!poster) {
      return NextResponse.json(
        { error: "Poster not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Poster deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting featured poster:", error)
    return NextResponse.json(
      { error: "Failed to delete featured poster" },
      { status: 500 }
    )
  }
}
