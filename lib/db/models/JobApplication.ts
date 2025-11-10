import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IJobApplication extends Document {
  _id: string
  jobId: mongoose.Types.ObjectId
  jobTitle: string
  
  userId: mongoose.Types.ObjectId
  userName: string
  userEmail: string
  userPhone: string
  
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
      required: true,
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
JobApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true }) // Prevent duplicate applications

const JobApplication = models.JobApplication || model<IJobApplication>("JobApplication", JobApplicationSchema)

export default JobApplication
