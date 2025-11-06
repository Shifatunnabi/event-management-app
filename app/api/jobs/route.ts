import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import Job from "@/lib/db/models/Job"

// GET - Get all public jobs
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    const filter: any = { status: "OPEN" }

    if (type && type !== "All Types") {
      filter.type = type
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { eventName: { $regex: search, $options: "i" } },
      ]
    }

    const jobs = await Job.find(filter)
      .sort({ postedDate: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      jobs,
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}
