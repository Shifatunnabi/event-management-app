import mongoose, { Schema, model, models, Document } from "mongoose"

export interface ITicket {
  ticketId: string
  ticketType: string
  qrCode: string
  qrSignature: string
}

export interface ITicketBooking extends Document {
  _id: string
  eventId: mongoose.Types.ObjectId
  eventSlug: string
  eventTitle: string
  eventDate: Date
  eventTime: string
  eventLocation: string
  eventImage: string
  
  userId: mongoose.Types.ObjectId
  userName: string
  userEmail: string
  userPhone: string
  
  // Booking details
  ticketType: string  // Which ticket type was purchased
  numberOfTickets: number
  pricePerTicket: number
  totalAmount: number
  
  // Payment details (only for premium tickets)
  senderBkashNumber?: string
  transactionId?: string  // Must be globally unique
  
  // Status tracking
  status: "RESERVED" | "PENDING" | "CONFIRMED" | "EXPIRED" | "REJECTED"
  
  // Email tracking
  ticketsSent: boolean
  emailSentAt?: Date
  emailRetryCount: number
  
  // Generated tickets
  tickets: ITicket[]
  
  // Timestamps
  reservedAt: Date
  expiresAt: Date  // reservedAt + 20 minutes
  paymentSubmittedAt?: Date
  confirmedAt?: Date
  
  // Rejection details
  rejectionReason?: string
  rejectedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}

const TicketSchema = new Schema<ITicket>({
  ticketId: {
    type: String,
    required: true,
  },
  ticketType: {
    type: String,
    required: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  qrSignature: {
    type: String,
    required: true,
  },
})

const TicketBookingSchema = new Schema<ITicketBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    eventSlug: {
      type: String,
      required: true,
    },
    eventTitle: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
    },
    eventLocation: {
      type: String,
      required: true,
    },
    eventImage: {
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
      lowercase: true,
    },
    userPhone: {
      type: String,
      required: true,
    },
    
    ticketType: {
      type: String,
      required: true,
    },
    numberOfTickets: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerTicket: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    senderBkashNumber: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
      sparse: true,  // Allows null/undefined but enforces uniqueness when present
    },
    
    status: {
      type: String,
      enum: ["RESERVED", "PENDING", "CONFIRMED", "EXPIRED", "REJECTED"],
      default: "RESERVED",
    },
    
    ticketsSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
    emailRetryCount: {
      type: Number,
      default: 0,
    },
    
    tickets: {
      type: [TicketSchema],
      default: [],
    },
    
    reservedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    paymentSubmittedAt: Date,
    confirmedAt: Date,
    
    rejectionReason: String,
    rejectedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes
TicketBookingSchema.index({ eventId: 1, status: 1 })
TicketBookingSchema.index({ eventSlug: 1, status: 1 })
TicketBookingSchema.index({ userId: 1, status: 1 })
TicketBookingSchema.index({ transactionId: 1 }, { unique: true, sparse: true }) // Global uniqueness
TicketBookingSchema.index({ status: 1, expiresAt: 1 }) // For cleanup queries
TicketBookingSchema.index({ "tickets.qrSignature": 1 }) // For QR validation

const TicketBooking = models.TicketBooking || model<ITicketBooking>("TicketBooking", TicketBookingSchema)

export default TicketBooking
