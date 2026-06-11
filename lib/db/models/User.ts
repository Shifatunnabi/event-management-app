import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  password: string
  profileImage?: string
  role: "USER" | "ORGANIZER" | "SUPER_ADMIN"

  // Organizer-specific fields
  organizerStatus?: "PENDING" | "APPROVED" | "REJECTED"
  isBanned?: boolean
  nidNumber?: string
  organizationName?: string

  // Password reset fields
  passwordResetCode?: string
  passwordResetExpires?: Date

  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    profileImage: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["USER", "ORGANIZER", "SUPER_ADMIN"],
      default: "USER",
    },
    
    // Organizer-specific fields
    organizerStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: undefined,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    nidNumber: {
      type: String,
      trim: true,
    },
    organizationName: {
      type: String,
      trim: true,
    },

    // Password reset fields
    passwordResetCode: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes (removed email since it's already unique in schema)
UserSchema.index({ role: 1 })
UserSchema.index({ organizerStatus: 1 })
UserSchema.index({ isBanned: 1 })

// In development, delete the cached model so schema changes (like new fields)
// take effect immediately without requiring a full server restart.
if (process.env.NODE_ENV !== "production" && models.User) {
  delete (models as Record<string, unknown>).User
}

const User = models.User || model<IUser>("User", UserSchema)

export default User
