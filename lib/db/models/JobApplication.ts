import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IJobApplication extends Document {
  _id: string
  jobId: mongoose.Types.ObjectId
  jobTitle: string
  
  userId?: mongoose.Types.ObjectId // Optional - for anonymous applications
  userName: string
  userEmail: string
  userPhone: string
  
  // Additional applicant details
  occupation: string
  age: number
  dateOfBirth: Date
  gender: string
  address: string
  experienceYears: number
  experienceDetails: string
  
  coverLetter?: string
  resumeUrl?: string
  
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
    
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional - for anonymous applications
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
      required: true,
    },
    
    // Additional applicant details
    occupation: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    experienceDetails: {
      type: String,
      required: true,
    },
    
    coverLetter: String,
    resumeUrl: String,
    
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
JobApplicationSchema.index({ userId: 1, appliedAt: -1 })
JobApplicationSchema.index({ jobId: 1, userEmail: 1 }, { unique: true }) // Prevent duplicate applications by email

const JobApplication = models.JobApplication || model<IJobApplication>("JobApplication", JobApplicationSchema)

export default JobApplication
