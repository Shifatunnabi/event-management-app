import mongoose, { Schema, model, models, Document } from "mongoose"

export interface IHeroSlide extends Document {
  _id: string
  eventId?: mongoose.Types.ObjectId
  title: string
  imageUrl: string
  order: number
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
HeroSlideSchema.index({ isActive: 1, order: 1 })
HeroSlideSchema.index({ eventId: 1 })

const HeroSlide = models.HeroSlide || model<IHeroSlide>("HeroSlide", HeroSlideSchema)

export default HeroSlide
