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
  slug?: string
  
  // Capacity management
  hasCapacityLimit: boolean
  totalCapacity: number | null
  ticketsSold: number
  
  // Ticket types
  ticketTypes: ITicketType[]
  
  // Status
  status: "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED" | "CANCELLED"
  isFeatured: boolean
  
  // Metadata
  attendees: number
  publishedAt?: Date
  cancelledAt?: Date
  cancellationReason?: string
  
  createdAt: Date
  updatedAt: Date
  
  // Helper methods
  getTicketType(): "FREE" | "PREMIUM"
  getMinimumPrice(): number
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
      required: false,
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
      required: false,
    },
    slug: {
      type: String,
      required: false,
    },
    
    hasCapacityLimit: {
      type: Boolean,
      default: false,
    },
    totalCapacity: {
      type: Number,
      default: null,
    },
    ticketsSold: {
      type: Number,
      default: 0,
    },
    
    ticketTypes: {
      type: [TicketTypeSchema],
      default: [],
    },
    
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "DRAFT",
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

// Helper methods
EventSchema.methods.getTicketType = function(): "FREE" | "PREMIUM" {
  if (!this.ticketTypes || this.ticketTypes.length === 0) {
    return "FREE"
  }
  
  // Check if all ticket types are free (price === 0)
  const allFree = this.ticketTypes.every((ticket: ITicketType) => ticket.price === 0)
  return allFree ? "FREE" : "PREMIUM"
}

EventSchema.methods.getMinimumPrice = function(): number {
  if (!this.ticketTypes || this.ticketTypes.length === 0) {
    return 0
  }
  
  // Find the minimum price among all ticket types
  return Math.min(...this.ticketTypes.map((ticket: ITicketType) => ticket.price))
}

// Indexes
EventSchema.index({ slug: 1 }, { unique: true, sparse: true })
EventSchema.index({ organizerId: 1, status: 1, date: 1 })
EventSchema.index({ status: 1, date: 1 })
EventSchema.index({ category: 1, date: 1 })
EventSchema.index({ isFeatured: 1, date: 1 })
EventSchema.index({ title: "text", description: "text", location: "text" })

const Event = models.Event || model<IEvent>("Event", EventSchema)

export default Event
