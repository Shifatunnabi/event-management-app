import mongoose, { Schema, Document } from "mongoose"

export interface IPopupAd extends Document {
  companyName: string
  description: string
  ctaLink: string
  ctaButton: string
  posterUrl: string
  active: boolean
  uploadedAt: Date
}

const PopupAdSchema = new Schema<IPopupAd>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    ctaLink: {
      type: String,
      required: true,
    },
    ctaButton: {
      type: String,
      default: "Know More",
    },
    posterUrl: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.PopupAd || mongoose.model<IPopupAd>("PopupAd", PopupAdSchema)
