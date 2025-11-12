import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import Vendor from "@/lib/db/models/Vendor"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      photo,
      serviceName,
      category,
      location,
      priceRange,
      organizationName,
      services,
      description,
      workLinks,
      portfolioImages,
    } = body

    // Validate required fields
    if (!name || !email || !phone || !address || !serviceName || !category || !location || !description) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      )
    }

    // Check if vendor application with this email already exists
    const existingVendor = await Vendor.findOne({ email })
    if (existingVendor) {
      return NextResponse.json(
        { error: "A vendor application with this email already exists" },
        { status: 400 }
      )
    }

    // Create vendor application (no user account)
    const vendor = await Vendor.create({
      name,
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
      appliedAt: new Date(),
    })

    return NextResponse.json(
      {
        success: true,
        message: "Vendor application submitted successfully! Please wait for admin approval.",
        vendor: {
          id: vendor._id,
          name: vendor.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error submitting vendor registration:", error)
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    )
  }
}
