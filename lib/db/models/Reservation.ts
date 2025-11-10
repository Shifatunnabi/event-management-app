import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IReservation extends Document {
  _id: string;
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  quantity: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "EXPIRED";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "EXPIRED"],
      default: "PENDING",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
ReservationSchema.index({ userId: 1, eventId: 1 });
ReservationSchema.index({ status: 1, expiresAt: 1 });

const Reservation =
  models.Reservation || model<IReservation>("Reservation", ReservationSchema);

export default Reservation;
