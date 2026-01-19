import mongoose, { Schema, model, models, Document } from "mongoose"
import "./Event" // Ensure Event model is registered

export interface IScanHistory {
  scannedAt: Date
  scannedBy: mongoose.Types.ObjectId
  scannedEventId?: mongoose.Types.ObjectId
  scannedEventTitle?: string
  isValidEvent: boolean
  location?: string
  qrCodeType?: string // Track which QR code type was scanned
}

export interface IQRCode {
  qrCodeType: string // entry, breakfast, lunch, snacks, dinner, gifts
  qrData: string
  qrSignature: string
  scanned: boolean
  scannedAt?: Date
}

export interface ITicket extends Document {
  _id: string
  ticketId: string
  bookingId: mongoose.Types.ObjectId
  eventId: mongoose.Types.ObjectId
  eventSlug: string
  eventTitle: string
  eventImage?: string
  eventDate: Date
  eventStartTime?: string
  eventEndTime?: string
  eventLocation: string
  
  userId: mongoose.Types.ObjectId
  userName: string
  userEmail: string
  
  orderId?: mongoose.Types.ObjectId
  
  ticketType: string
  price?: number
  
  // QR Codes - multiple codes for different purposes
  qrCodes: IQRCode[]
  
  // Legacy single QR (for backward compatibility)
  qrData?: string
  qrSignature?: string
  
  // Status
  status: "ACTIVE" | "SCANNED" | "WRONG_EVENT" | "EXPIRED" | "CANCELLED"
  
  // Scan tracking
  scannedAt?: Date
  scanHistory: IScanHistory[]
  
  // Email status
  emailSent: boolean
  
  purchaseDate: Date
  createdAt: Date
  updatedAt: Date
}

const ScanHistorySchema = new Schema<IScanHistory>({
  scannedAt: { type: Date, required: true },
  scannedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  scannedEventId: { type: Schema.Types.ObjectId, ref: "Event" },
  scannedEventTitle: String,
  isValidEvent: { type: Boolean, required: true },
  location: String,
  qrCodeType: String,
})

const QRCodeSchema = new Schema<IQRCode>({
  qrCodeType: {
    type: String,
    required: true,
    enum: ["entry", "breakfast", "lunch", "snacks", "dinner", "gifts"],
  },
  qrData: {
    type: String,
    required: true,
  },
  qrSignature: {
    type: String,
    required: true,
  },
  scanned: {
    type: Boolean,
    default: false,
  },
  scannedAt: Date,
})

const TicketSchema = new Schema<ITicket>(
  {
    ticketId: {
      type: String,
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "TicketBooking",
      required: true,
    },
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
    eventImage: {
      type: String,
      required: false,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventStartTime: {
      type: String,
      required: false,
    },
    eventEndTime: {
      type: String,
      required: false,
    },
    eventLocation: {
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
    
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
    
    ticketType: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: false,
      min: 0,
    },
    
    // QR Codes - multiple codes for different purposes
    qrCodes: {
      type: [QRCodeSchema],
      default: [],
    },
    
    // Legacy single QR code fields (for backward compatibility)
    qrData: {
      type: String,
      required: false,
    },
    qrSignature: {
      type: String,
      required: false,
    },
    
    status: {
      type: String,
      enum: ["ACTIVE", "SCANNED", "WRONG_EVENT", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
    },
    
    scannedAt: Date,
    scanHistory: {
      type: [ScanHistorySchema],
      default: [],
    },
    
    emailSent: {
      type: Boolean,
      default: false,
      required: true,
    },
    
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
TicketSchema.index({ userId: 1, eventId: 1 })
TicketSchema.index({ eventId: 1, status: 1 })
TicketSchema.index({ "qrCodes.qrSignature": 1 })
TicketSchema.index({ orderId: 1 })

const Ticket = models.Ticket || model<ITicket>("Ticket", TicketSchema)

export default Ticket
