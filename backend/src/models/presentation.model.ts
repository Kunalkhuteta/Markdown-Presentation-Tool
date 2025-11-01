import mongoose from "mongoose";

const presentationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    theme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theme",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Presentation = mongoose.model("Presentation", presentationSchema);
export default Presentation;