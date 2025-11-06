import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IJobApplication extends Document {
  _id: string
  jobId: mongoose.Types.ObjectId
  jobTitle: string
  
  // Applicant personal info
  name: string
  email: string
  phone?: string
  occupation: string
  age: number
  dateOfBirth: Date
  gender: "MALE" | "FEMALE" | "OTHER"
  address: string
  
  // Experience
  experienceYears: number
  experienceDetails: string
  
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED"
  
  appliedAt: Date
  reviewedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    
    // Applicant personal info
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      required: [true, "Occupation is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: 18,
      max: 100,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: [true, "Gender is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    
    // Experience
    experienceYears: {
      type: Number,
      required: [true, "Experience years is required"],
      min: 0,
    },
    experienceDetails: {
      type: String,
      required: [true, "Experience details are required"],
      trim: true,
    },
    
    status: {
      type: String,
      enum: ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes
JobApplicationSchema.index({ jobId: 1, status: 1 })
JobApplicationSchema.index({ email: 1, appliedAt: -1 })
JobApplicationSchema.index({ jobId: 1, email: 1 }, { unique: true }) // Prevent duplicate applications

const JobApplication = models.JobApplication || model<IJobApplication>("JobApplication", JobApplicationSchema)

export default JobApplication
