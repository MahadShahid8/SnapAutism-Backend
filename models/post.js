import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  content: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username:{ type: String},
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  replies: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      username:{ type: String },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



export const Post = mongoose.model("Post", postSchema);
