import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import Vendor from "@/lib/db/models/Vendor"

// POST - Apply to be a vendor
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      fullName,
      photo,
      serviceName,
      category,
      phone,
      email,
      location,
      priceRange,
      organizationName,
      services,
      description,
      workLinks,
      portfolioImages,
    } = body

    // Validate required fields
    if (!fullName || !serviceName || !category || !phone || !email || !location || !description) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingVendor = await Vendor.findOne({ email })
    if (existingVendor) {
      return NextResponse.json(
        { error: "A vendor application with this email already exists" },
        { status: 400 }
      )
    }

    // Create vendor application
    const vendor = await Vendor.create({
      name: fullName,
      photo,
      serviceName,
      category,
      phone,
      email,
      location,
      priceRange: priceRange || "$$ - Moderate",
      organizationName,
      services: services || [],
      description,
      workLinks: workLinks || [],
      portfolioImages: portfolioImages || [],
      approvalStatus: "PENDING",
    })

    return NextResponse.json(
      {
        success: true,
        message: "Vendor application submitted successfully",
        vendor: {
          id: vendor._id,
          name: vendor.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error submitting vendor application:", error)
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    )
  }
}

// GET - Get all approved vendors (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const filter: any = { approvalStatus: "APPROVED" }

    if (category && category !== "All Categories") {
      filter.category = category
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { serviceName: { $regex: search, $options: "i" } },
      ]
    }

    const vendors = await Vendor.find(filter)
      .select("-userId -approvalStatus -rejectedAt -createdAt -updatedAt")
      .sort({ approvedAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      vendors,
    })
  } catch (error) {
    console.error("Error fetching vendors:", error)
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    )
  }
}
