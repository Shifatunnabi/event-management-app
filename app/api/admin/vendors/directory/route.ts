import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import Vendor from "@/lib/db/models/Vendor"

// DELETE - Delete approved vendor
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
        { error: "Only super admins can delete vendors" },
        { status: 403 }
      )
    }

    const { vendorId } = await request.json()

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 })
    }

    const vendor = await Vendor.findById(vendorId)

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    await Vendor.findByIdAndDelete(vendorId)

    return NextResponse.json({
      success: true,
      message: "Vendor deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting vendor:", error)
    return NextResponse.json(
      { error: "Failed to delete vendor" },
      { status: 500 }
    )
  }
}

// GET - Get all approved vendors (for admin management)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can access vendor directory" },
        { status: 403 }
      )
    }

    const vendors = await Vendor.find({ approvalStatus: "APPROVED" })
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
