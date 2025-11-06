import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IOrderItem {
  ticketType: string
  price: number
  quantity: number
  subtotal: number
}

export interface IOrder extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  userName: string
  userEmail: string
  
  eventId: mongoose.Types.ObjectId
  eventTitle: string
  
  items: IOrderItem[]
  totalAmount: number
  
  // Payment
  paymentStatus: "PENDING" | "INITIATED" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED"
  paymentGateway: "MOCK" | "SSLCOMMERZ" | "STRIPE"
  transactionId?: string
  paymentDetails?: any
  
  // Metadata
  paidAt?: Date
  failedAt?: Date
  cancelledAt?: Date
  refundedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  ticketType: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min: 0 },
})

const OrderSchema = new Schema<IOrder>(
  {
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
    
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    eventTitle: {
      type: String,
      required: true,
    },
    
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    paymentStatus: {
      type: String,
      enum: ["PENDING", "INITIATED", "PAID", "FAILED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },
    paymentGateway: {
      type: String,
      enum: ["MOCK", "SSLCOMMERZ", "STRIPE"],
      default: "MOCK",
    },
    transactionId: String,
    paymentDetails: Schema.Types.Mixed,
    
    paidAt: Date,
    failedAt: Date,
    cancelledAt: Date,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes
OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ eventId: 1, paymentStatus: 1 })
OrderSchema.index({ paymentStatus: 1, createdAt: -1 })
OrderSchema.index({ transactionId: 1 })

const Order = models.Order || model<IOrder>("Order", OrderSchema)

export default Order
