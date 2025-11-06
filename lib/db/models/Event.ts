import mongoose, { Schema, model, models, Document } from "mongoose"

export interface ITicketType {
  name: string
  price: number
  hasLimit: boolean
  quantity: number | null
  sold: number
  available: number | null
}

export interface IEvent extends Document {
  _id: string
  title: string
  slug: string
  description: string
  image: string
  date: Date
  time: string
  location: string
  locationLink?: string
  category: string
  organizerId: mongoose.Types.ObjectId
  organizerName: string
  organizationName?: string
  
  // Ticket information
  ticketType: "FREE" | "PREMIUM"
  ticketPrice?: number
  hasTicketLimit: boolean
  totalTickets?: number
  ticketsSold: number
  
  // For free events - interested/going
  interested: mongoose.Types.ObjectId[]
  going: mongoose.Types.ObjectId[]
  
  // Status
  status: "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED" | "CANCELLED" | "HIDDEN"
  isFeatured: boolean
  
  // Metadata
  attendees: number
  publishedAt?: Date
  cancelledAt?: Date
  cancellationReason?: string
  
  createdAt: Date
  updatedAt: Date
}

const TicketTypeSchema = new Schema<ITicketType>({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  hasLimit: { type: Boolean, default: true },
  quantity: { type: Number, default: null },
  sold: { type: Number, default: 0 },
  available: { type: Number, default: null },
})

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    locationLink: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
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
    organizationName: {
      type: String,
    },
    
    ticketType: {
      type: String,
      enum: ["FREE", "PREMIUM"],
      required: true,
      default: "FREE",
    },
    ticketPrice: {
      type: Number,
      min: 0,
    },
    hasTicketLimit: {
      type: Boolean,
      default: false,
    },
    totalTickets: {
      type: Number,
      min: 0,
    },
    ticketsSold: {
      type: Number,
      default: 0,
    },
    
    interested: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    going: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED", "HIDDEN"],
      default: "PUBLISHED",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    
    attendees: {
      type: Number,
      default: 0,
    },
    publishedAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
)

// Indexes
EventSchema.index({ slug: 1 }, { unique: true })
EventSchema.index({ organizerId: 1, status: 1, date: 1 })
EventSchema.index({ status: 1, date: 1 })
EventSchema.index({ category: 1, date: 1 })
EventSchema.index({ isFeatured: 1, date: 1 })
EventSchema.index({ title: "text", description: "text", location: "text" })

const Event = models.Event || model<IEvent>("Event", EventSchema)

export default Event
