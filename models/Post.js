import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },

    text: {
      type: String,
      require: true,
      unique: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    imegeUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Post", PostSchema); // "User"название схемы в базе   UserSchema сама схема
