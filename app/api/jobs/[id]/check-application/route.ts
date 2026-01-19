import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import JobApplication from "@/lib/db/models/JobApplication"

// GET - Check if user has already applied for this job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { hasApplied: false },
        { status: 200 }
      )
    }

    // Check if application exists
    const existingApplication = await JobApplication.findOne({
      jobId: id,
      userEmail: email.toLowerCase(),
    })

    return NextResponse.json(
      {
        success: true,
        hasApplied: !!existingApplication,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error checking application status:", error)
    return NextResponse.json(
      { error: "Failed to check application status", hasApplied: false },
      { status: 500 }
    )
  }
}
