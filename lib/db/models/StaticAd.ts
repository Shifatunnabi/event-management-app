import mongoose, { Schema, Document } from "mongoose"

export interface IStaticAd extends Document {
  companyName: string
  description: string
  ctaLink: string
  posterUrl: string
  active: boolean
  uploadedAt: Date
}

const StaticAdSchema = new Schema<IStaticAd>(
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

export default mongoose.models.StaticAd || mongoose.model<IStaticAd>("StaticAd", StaticAdSchema)
