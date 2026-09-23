import mongoose from "mongoose";

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    channel_categorey : {
      type: String,
      enum: [
        "technology",
        "gaming",
        "fitness",
        "animations" ,
        "AI generated videos" ,
        "finance",
        "fashion",
        "beauty",
        "travel",
        "food",
        "business",
        "entertainment",
        "lifestyle",
        "other"
      ],
      required: true
    },

    format: {
      type: [String],
      enum: [
        "short-video",
        "long-video",
        "reels",
        "carousel",
        "text-post",
        "livestream",
        "podcast"
      ],
      required: true
    },

    audience: {
      type: String,
      required: true,
      trim: true
    },

    language: {
      type: [String],
      enum: [
        "english",
        "urdu",
        "hindi",
        "arabic",
        "spanish",
        "french",
        "other"
      ],
      required: true
    },

    channelUrl: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const CreatorProfile = mongoose.model("CreatorProfile",creatorProfileSchema);
