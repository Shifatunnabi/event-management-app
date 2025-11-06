import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import Job from "@/lib/db/models/Job"
import JobApplication from "@/lib/db/models/JobApplication"

// GET - Get all applications for a specific job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "ORGANIZER" || user.organizerStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved organizers can view applications" },
        { status: 403 }
      )
    }

    const { id } = await params
    const job = await Job.findById(id)

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check ownership
    if (job.organizerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You can only view applications for your own jobs" },
        { status: 403 }
      )
    }

    const applications = await JobApplication.find({ jobId: id })
      .sort({ appliedAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      job,
      applications,
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}
