import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import Vendor from "@/lib/db/models/Vendor"

// POST - Approve vendor application
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
        { error: "Only super admins can approve vendors" },
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

    vendor.approvalStatus = "APPROVED"
    vendor.approvedAt = new Date()
    await vendor.save()

    return NextResponse.json({
      success: true,
      message: "Vendor approved successfully",
    })
  } catch (error) {
    console.error("Error approving vendor:", error)
    return NextResponse.json(
      { error: "Failed to approve vendor" },
      { status: 500 }
    )
  }
}
