import mongoose, { Schema, model, models, Document } from "mongoose"
import "./Event" // Ensure Event model is registered

export interface IScanHistory {
  scannedAt: Date
  scannedBy: mongoose.Types.ObjectId
  scannedEventId?: mongoose.Types.ObjectId
  scannedEventTitle?: string
  isValidEvent: boolean
  location?: string
}

export interface ITicket extends Document {
  _id: string
  eventId: mongoose.Types.ObjectId
  eventTitle: string
  eventImage: string
  eventDate: Date
  eventLocation: string
  
  userId: mongoose.Types.ObjectId
  userName: string
  userEmail: string
  
  orderId: mongoose.Types.ObjectId
  
  ticketType: string
  price: number
  
  // QR Code data
  qrData: string
  qrSignature: string
  
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
})

const TicketSchema = new Schema<ITicket>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    eventTitle: {
      type: String,
      required: true,
    },
    eventImage: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
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
      required: true,
    },
    
    ticketType: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    
    qrData: {
      type: String,
      required: true,
      unique: true,
    },
    qrSignature: {
      type: String,
      required: true,
      unique: true,
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
TicketSchema.index({ qrSignature: 1 })
TicketSchema.index({ orderId: 1 })

const Ticket = models.Ticket || model<ITicket>("Ticket", TicketSchema)

export default Ticket
