import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, password, confirmPassword, userType, nidNumber, organizationName } = body

    // Validation
    if (!name || !email || !phone || !address || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email" },
        { status: 400 }
      )
    }

    // For organizer, validate additional fields
    if (userType === "ORGANIZER") {
      if (!nidNumber || !organizationName) {
        return NextResponse.json(
          { error: "NID number and organization name are required for organizers" },
          { status: 400 }
        )
      }
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const userData: any = {
      name,
      email: email.toLowerCase(),
      phone,
      address,
      password: hashedPassword,
      role: userType === "ORGANIZER" ? "ORGANIZER" : "USER",
    }

    // Add organizer-specific fields
    if (userType === "ORGANIZER") {
      userData.organizerStatus = "PENDING"
      userData.nidNumber = nidNumber
      userData.organizationName = organizationName
    }

    const user = await User.create(userData)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: userType === "ORGANIZER"
          ? "Registration successful! Your account is pending admin approval."
          : "Registration successful! You can now login.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizerStatus: user.organizerStatus,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error.message || "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}
