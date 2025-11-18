import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password")
        }

        await connectDB()

        const email = credentials.email as string
        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        // Check if organizer is pending approval
        if (user.role === "ORGANIZER" && user.organizerStatus === "PENDING") {
          throw new Error("PENDING_APPROVAL")
        }

        // Check if organizer was rejected
        if (user.role === "ORGANIZER" && user.organizerStatus === "REJECTED") {
          throw new Error("REJECTED")
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          organizerStatus: user.organizerStatus,
          organizationName: user.organizationName,
          profileImage: user.profileImage,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign in, set the token from the user object
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizerStatus = user.organizerStatus
        token.organizationName = user.organizationName
        token.profileImage = (user as any).profileImage
      }
      
      // Refresh user data from database on each request to get latest profileImage
      if (token.id && trigger !== "signIn") {
        try {
          await connectDB()
          const freshUser = await User.findById(token.id).lean()
          if (freshUser) {
            token.profileImage = freshUser.profileImage
            token.organizerStatus = freshUser.organizerStatus
            token.organizationName = freshUser.organizationName
          }
        } catch (error) {
          console.error("Error refreshing user data in JWT:", error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.organizerStatus = token.organizerStatus as string | undefined
        session.user.organizationName = token.organizationName as string | undefined
        ;(session.user as any).profileImage = token.profileImage as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig
