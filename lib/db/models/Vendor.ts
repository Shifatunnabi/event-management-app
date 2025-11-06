import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IVendor extends Document {
  _id: string
  userId?: mongoose.Types.ObjectId
  name: string
  photo?: string
  serviceName: string
  category: string
  
  phone: string
  email: string
  location: string
  
  description: string
  priceRange: string
  services: string[]
  
  organizationName?: string
  workLinks: { label: string; url: string }[]
  portfolioImages: string[]
  
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED"
  
  rating: number
  reviewCount: number
  
  appliedAt: Date
  approvedAt?: Date
  rejectedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}

const VendorSchema = new Schema<IVendor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    photo: {
      type: String,
    },
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    priceRange: {
      type: String,
      default: "$$ - Moderate",
    },
    services: {
      type: [String],
      default: [],
    },
    
    organizationName: String,
    workLinks: {
      type: [
        {
          label: String,
          url: String,
        },
      ],
      default: [],
    },
    portfolioImages: {
      type: [String],
      default: [],
    },
    
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: Date,
    rejectedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes
VendorSchema.index({ approvalStatus: 1 })
VendorSchema.index({ category: 1, approvalStatus: 1 })
VendorSchema.index({ userId: 1 })

const Vendor = models.Vendor || model<IVendor>("Vendor", VendorSchema)

export default Vendor
