import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import PopupAd from "@/lib/db/models/PopupAd"
import User from "@/lib/db/models/User"

// GET - Get all popup ads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("activeOnly") === "true"

    await connectDB()

    const filter = activeOnly ? { active: true } : {}
    const ads = await PopupAd.find(filter)
      .sort({ uploadedAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      ads,
    })
  } catch (error) {
    console.error("Error fetching popup ads:", error)
    return NextResponse.json(
      { error: "Failed to fetch popup ads" },
      { status: 500 }
    )
  }
}

// POST - Create new popup ad (admin only)
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
        { error: "Only super admins can create popup ads" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { companyName, description, ctaLink, ctaButton, posterUrl } = body

    // Validate required fields
    if (!companyName || !description || !ctaLink || !posterUrl) {
      return NextResponse.json(
        { error: "Company name, description, CTA link, and poster URL are required" },
        { status: 400 }
      )
    }

    // Create popup ad
    const ad = await PopupAd.create({
      companyName,
      description,
      ctaLink,
      ctaButton: ctaButton || "Know More",
      posterUrl,
      active: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Popup ad created successfully",
        ad,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating popup ad:", error)
    return NextResponse.json(
      { error: "Failed to create popup ad" },
      { status: 500 }
    )
  }
}

// PATCH - Update popup ad status (activate/deactivate)
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
        { error: "Only super admins can update popup ads" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { adId, active } = body

    if (!adId || typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Ad ID and active status are required" },
        { status: 400 }
      )
    }

    const ad = await PopupAd.findByIdAndUpdate(
      adId,
      { active },
      { new: true }
    )

    if (!ad) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Ad ${active ? "activated" : "deactivated"} successfully`,
      ad,
    })
  } catch (error) {
    console.error("Error updating popup ad:", error)
    return NextResponse.json(
      { error: "Failed to update popup ad" },
      { status: 500 }
    )
  }
}

// PUT - Update popup ad details
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
        { error: "Only super admins can update popup ads" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { adId, companyName, description, ctaLink, ctaButton, posterUrl } = body

    if (!adId || !companyName || !description || !ctaLink || !posterUrl) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const ad = await PopupAd.findByIdAndUpdate(
      adId,
      { companyName, description, ctaLink, ctaButton: ctaButton || "Know More", posterUrl },
      { new: true }
    )

    if (!ad) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Ad updated successfully",
      ad,
    })
  } catch (error) {
    console.error("Error updating popup ad:", error)
    return NextResponse.json(
      { error: "Failed to update popup ad" },
      { status: 500 }
    )
  }
}

// DELETE - Delete popup ad
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
        { error: "Only super admins can delete popup ads" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const adId = searchParams.get("adId")

    if (!adId) {
      return NextResponse.json(
        { error: "Ad ID is required" },
        { status: 400 }
      )
    }

    const ad = await PopupAd.findByIdAndDelete(adId)

    if (!ad) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Ad deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting popup ad:", error)
    return NextResponse.json(
      { error: "Failed to delete popup ad" },
      { status: 500 }
    )
  }
}
