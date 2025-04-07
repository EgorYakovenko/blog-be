import mongoose from "mongoose";
import { stringify } from "querystring";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      require: true,
    },

    email: {
      type: String,
      require: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      require: true,
    },
    avatarUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema); // "User"название схемы в базе   UserSchema сама схема
