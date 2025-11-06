import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import Job from "@/lib/db/models/Job"

// POST - Create a new job
export async function POST(request: NextRequest) {
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
        { error: "Only approved organizers can post jobs" },
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

    // Validate required fields
    if (!title || !location || !date || !duration || !salary || !type || !description) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Create job
    const job = await Job.create({
      title,
      eventName: eventName || "",
      location,
      date: new Date(date),
      duration,
      salary,
      type,
      description,
      requirements: [],
      organizerId: user._id,
      organizerName: user.name,
      status: "OPEN",
      applicants: 0,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Job posted successfully",
        job: {
          id: job._id,
          title: job.title,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    )
  }
}

// GET - Get organizer's jobs
export async function GET(request: NextRequest) {
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
        { error: "Only approved organizers can view their jobs" },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const filter: any = { organizerId: user._id }
    if (status) {
      filter.status = status
    }

    const jobs = await Job.find(filter)
      .sort({ postedDate: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      jobs,
    })
  } catch (error) {
    console.error("Error fetching organizer jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}
