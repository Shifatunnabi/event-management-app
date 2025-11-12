import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import Job from "@/lib/db/models/Job"
import JobApplication from "@/lib/db/models/JobApplication"

// POST - Apply for a job (no authentication required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const job = await Job.findById(id)

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (job.status !== "OPEN") {
      return NextResponse.json(
        { error: "This job is no longer accepting applications" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      occupation,
      age,
      dateOfBirth,
      gender,
      address,
      experienceYears,
      experienceDetails,
      coverLetter,
      resumeUrl,
    } = body

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !occupation ||
      !age ||
      !dateOfBirth ||
      !gender ||
      !address ||
      experienceYears === undefined ||
      !experienceDetails
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Check for duplicate application by email
    const existingApplication = await JobApplication.findOne({
      jobId: id,
      userEmail: email.toLowerCase(),
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 })
    }

    // Create application (no userId field for anonymous applications)
    const application = await JobApplication.create({
      jobId: id,
      jobTitle: job.title,
      // userId is intentionally omitted for anonymous applications
      userName: name,
      userEmail: email.toLowerCase(),
      userPhone: phone,
      occupation,
      age: Number(age),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      address,
      experienceYears: Number(experienceYears),
      experienceDetails,
      coverLetter: coverLetter || undefined,
      resumeUrl: resumeUrl || undefined,
      status: "PENDING",
    })

    // Increment applicants count
    job.applicants = (job.applicants || 0) + 1
    await job.save()

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        application: {
          id: application._id,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error submitting application:", error)
    
    // Handle duplicate key error (unique index on jobId + email)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You have already applied for this job" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    )
  }
}
