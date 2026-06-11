import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json()

    if (!email || !code || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
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

    const hashedPassword = await bcrypt.hash(password, 12)

    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { passwordResetCode: "", passwordResetExpires: "" },
      },
      { strict: false }
    )

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error: any) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Password reset failed. Please try again." },
      { status: 500 }
    )
  }
}
