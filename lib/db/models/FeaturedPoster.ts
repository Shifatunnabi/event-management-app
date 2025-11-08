import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IFeaturedPoster extends Document {
  _id: string
  eventName: string
  eventLink: string
  posterUrl: string
  active: boolean
  uploadedAt: Date
  createdAt: Date
  updatedAt: Date
}

const FeaturedPosterSchema = new Schema<IFeaturedPoster>(
  {
    eventName: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
    },
    eventLink: {
      type: String,
      required: [true, "Event link is required"],
      trim: true,
    },
    posterUrl: {
      type: String,
      required: [true, "Poster URL is required"],
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

const FeaturedPoster = models.FeaturedPoster || model<IFeaturedPoster>("FeaturedPoster", FeaturedPosterSchema)

export default FeaturedPoster
