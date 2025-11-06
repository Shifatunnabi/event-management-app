import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  password: string
  role: "USER" | "ORGANIZER" | "SUPER_ADMIN"
  
  // Organizer-specific fields
  organizerStatus?: "PENDING" | "APPROVED" | "REJECTED"
  nidNumber?: string
  organizationName?: string
  
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
    nidNumber: {
      type: String,
      trim: true,
    },
    organizationName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes (removed email since it's already unique in schema)
UserSchema.index({ role: 1 })
UserSchema.index({ organizerStatus: 1 })

const User = models.User || model<IUser>("User", UserSchema)

export default User
