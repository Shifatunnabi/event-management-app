import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import { sendPasswordResetEmail } from "@/lib/email/reset-password-email"

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase().trim() })

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ message: "Verification code sent to your email" })
    }

    const code = generateCode()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await User.updateOne(
      { _id: user._id },
      { $set: { passwordResetCode: code, passwordResetExpires: expires } },
      { strict: false }
    )

    await sendPasswordResetEmail(user.email, code)

    return NextResponse.json({ message: "Verification code sent to your email" })
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    )
  }
}
