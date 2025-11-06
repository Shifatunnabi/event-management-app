import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import Job from "@/lib/db/models/Job"

// PATCH - Update a job
export async function PATCH(
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
        { error: "Only approved organizers can update jobs" },
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
        { error: "You can only update your own jobs" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      eventName,
      location,
      date,
      duration,
      salary,
      type,
      description,
    } = body

    // Update fields
    if (title) job.title = title
    if (eventName !== undefined) job.eventName = eventName
    if (location) job.location = location
    if (date) job.date = new Date(date)
    if (duration) job.duration = duration
    if (salary) job.salary = salary
    if (type) job.type = type
    if (description) job.description = description

    await job.save()

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      job,
    })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a job
export async function DELETE(
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
        { error: "Only approved organizers can delete jobs" },
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
        { error: "You can only delete your own jobs" },
        { status: 403 }
      )
    }

    await Job.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    )
  }
}
