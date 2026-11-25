
import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    industry: {
      type: String,
      default: "General",
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    contactEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 30,
    },

    website: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Business = mongoose.model("Business", businessSchema);

export default Business;
