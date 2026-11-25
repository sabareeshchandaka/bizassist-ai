
import mongoose from "mongoose";
import { randomBytes } from "crypto";

const widgetConfigSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
      index: true,
    },

    widgetId: {
      type: String,
      unique: true,
      required: true,
      default: () => randomBytes(16).toString("hex"),
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    assistantName: {
      type: String,
      default: "AI Assistant",
      trim: true,
      maxlength: 60,
    },

    welcomeMessage: {
      type: String,
      default: "Hello! How can I help you today?",
      trim: true,
      maxlength: 300,
    },

    primaryColor: {
      type: String,
      default: "#4F46E5",
      match: /^#[0-9A-Fa-f]{6}$/,
    },

    allowedDomains: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const WidgetConfig = mongoose.model(
  "WidgetConfig",
  widgetConfigSchema
);

export default WidgetConfig;
