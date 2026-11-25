
import mongoose from "mongoose";

const widgetMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const widgetConversationSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    widgetId: {
      type: String,
      required: true,
      index: true,
    },

    // Unique ID for one visitor's widget session.
    visitorId: {
      type: String,
      required: true,
    },

    messages: {
      type: [widgetMessageSchema],
      default: [],
    },

    firstMessage: {
      type: String,
      default: "",
      trim: true,
    },

    messageCount: {
      type: Number,
      default: 0,
    },

    userMessageCount: {
      type: Number,
      default: 0,
    },

    assistantMessageCount: {
      type: Number,
      default: 0,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// One conversation document per visitor session and widget.
widgetConversationSchema.index(
  {
    business: 1,
    widgetId: 1,
    visitorId: 1,
  },
  {
    unique: true,
  }
);

// Useful for analytics and conversation-history queries.
widgetConversationSchema.index({
  business: 1,
  lastMessageAt: -1,
});

const WidgetConversation = mongoose.model(
  "WidgetConversation",
  widgetConversationSchema
);

export default WidgetConversation;
