import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean()

    if (!user || !user.passwordResetCode || !user.passwordResetExpires) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    if (new Date() > new Date(user.passwordResetExpires)) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 })
    }

    if (user.passwordResetCode.trim() !== code.trim()) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch (error: any) {
    console.error("Verify reset code error:", error)
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    )
  }
}
