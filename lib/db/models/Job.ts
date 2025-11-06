import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IJob extends Document {
  _id: string
  title: string
  eventId?: mongoose.Types.ObjectId
  eventName?: string
  
  organizerId: mongoose.Types.ObjectId
  organizerName: string
  
  location: string
  date: Date
  duration: string
  salary: string
  type: string
  description: string
  requirements: string[]
  
  status: "OPEN" | "CLOSED"
  applicants: number
  
  postedDate: Date
  closedDate?: Date
  
  createdAt: Date
  updatedAt: Date
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
    eventName: {
      type: String,
      trim: true,
    },
    
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizerName: {
      type: String,
      required: true,
    },
    
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    salary: {
      type: String,
      required: [true, "Salary is required"],
    },
    type: {
      type: String,
      required: [true, "Job type is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    requirements: {
      type: [String],
      default: [],
    },
    
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
    applicants: {
      type: Number,
      default: 0,
    },
    
    postedDate: {
      type: Date,
      default: Date.now,
    },
    closedDate: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes
JobSchema.index({ organizerId: 1, status: 1 })
JobSchema.index({ status: 1, postedDate: -1 })
JobSchema.index({ eventId: 1 })

const Job = models.Job || model<IJob>("Job", JobSchema)

export default Job
