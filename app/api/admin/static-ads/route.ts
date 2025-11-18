import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import StaticAd from "@/lib/db/models/StaticAd"
import User from "@/lib/db/models/User"

// GET - Get all static ads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("activeOnly") === "true"

    await connectDB()

    const filter = activeOnly ? { active: true } : {}
    const ads = await StaticAd.find(filter)
      .sort({ uploadedAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      ads,
    })
  } catch (error) {
    console.error("Error fetching static ads:", error)
    return NextResponse.json(
      { error: "Failed to fetch static ads" },
      { status: 500 }
    )
  }
}

// POST - Create new static ad (admin only)
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
        { error: "Only super admins can create static ads" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { companyName, description, ctaLink, posterUrl } = body

    // Validate required fields
    if (!companyName || !description || !ctaLink || !posterUrl) {
      return NextResponse.json(
        { error: "Company name, description, CTA link, and poster URL are required" },
        { status: 400 }
      )
    }

    // Create static ad
    const ad = await StaticAd.create({
      companyName,
      description,
      ctaLink,
      posterUrl,
      active: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Static ad created successfully",
        ad,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating static ad:", error)
    return NextResponse.json(
      { error: "Failed to create static ad" },
      { status: 500 }
    )
  }
}

// PATCH - Update static ad status (activate/deactivate)
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
        { error: "Only super admins can update static ads" },
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

    const ad = await StaticAd.findByIdAndUpdate(
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
    console.error("Error updating static ad:", error)
    return NextResponse.json(
      { error: "Failed to update static ad" },
      { status: 500 }
    )
  }
}

// PUT - Update static ad details
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
        { error: "Only super admins can update static ads" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { adId, companyName, description, ctaLink, posterUrl } = body

    if (!adId || !companyName || !description || !ctaLink || !posterUrl) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const ad = await StaticAd.findByIdAndUpdate(
      adId,
      { companyName, description, ctaLink, posterUrl },
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
    console.error("Error updating static ad:", error)
    return NextResponse.json(
      { error: "Failed to update static ad" },
      { status: 500 }
    )
  }
}

// DELETE - Delete static ad
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
        { error: "Only super admins can delete static ads" },
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

    const ad = await StaticAd.findByIdAndDelete(adId)

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
    console.error("Error deleting static ad:", error)
    return NextResponse.json(
      { error: "Failed to delete static ad" },
      { status: 500 }
    )
  }
}
