
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Business from "../models/Business.js";
import generateAIResponse from "../services/aiService.js";
import retrieveRelevantChunks from "../services/retrievalService.js";

// Reusable ownership filter
const getConversationFilter = (req) => ({
  _id: req.params.id,
  business: req.user.business,
  user: req.user._id,
});

// POST /api/chat/conversations
export const createConversation = async (req, res) => {
  try {
    const conversation = await Conversation.create({
      business: req.user.business,
      user: req.user._id,
      title: "New Conversation",
      messages: [],
    });

    return res.status(201).json({
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      message: "Unable to create conversation",
    });
  }
};

// GET /api/chat/conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      business: req.user.business,
      user: req.user._id,
    })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      message: "Unable to retrieve conversations",
    });
  }
};

// GET /api/chat/conversations/:id
export const getConversation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findOne(
      getConversationFilter(req)
    ).lean();

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      conversation,
    });
  } catch (error) {
    console.error("Get conversation error:", error);

    return res.status(500).json({
      message: "Unable to load conversation",
    });
  }
};

// PATCH /api/chat/conversations/:id
export const renameConversation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    const { title } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Title must contain between 1 and 100 characters",
      });
    }

    const conversation = await Conversation.findOneAndUpdate(
      getConversationFilter(req),
      {
        $set: {
          title: title.trim(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      message: "Conversation renamed successfully",
      conversation,
    });
  } catch (error) {
    console.error("Rename conversation error:", error);

    return res.status(500).json({
      message: "Unable to rename conversation",
    });
  }
};

// DELETE /api/chat/conversations/:id
export const deleteConversation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findOneAndDelete(
      getConversationFilter(req)
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      message: "Conversation deleted successfully",
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("Delete conversation error:", error);

    return res.status(500).json({
      message: "Unable to delete conversation",
    });
  }
};

// POST /api/chat/message
export const sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.trim().length > 4000
    ) {
      return res.status(400).json({
        message: "Enter a message of up to 4000 characters",
      });
    }

    const business = await Business.findById(req.user.business);

    if (!business) {
      return res.status(404).json({
        message: "Business workspace not found",
      });
    }

    
let conversation;

if (conversationId) {
  if (!mongoose.isValidObjectId(conversationId)) {
    return res.status(400).json({
      message: "Invalid conversation ID",
    });
  }

  conversation = await Conversation.findOne({
    _id: conversationId,
    business: business._id,
    user: req.user._id,
  });

  if (!conversation) {
    return res.status(404).json({
      message: "Conversation not found",
    });
  }
} else {
  // Create an unsaved conversation.
  // It will only be saved after successful AI generation.
  conversation = new Conversation({
    business: business._id,
    user: req.user._id,
    title: "New Conversation",
    messages: [],
  });
}

// Prepare messages without modifying the stored conversation.
const userMessage = {
  role: "user",
  content: message.trim(),
};

const contextMessages = [
  ...conversation.messages.slice(-10).map((item) => ({
    role: item.role,
    content: item.content,
  })),
  userMessage,
];

// Retrieve business-specific knowledge.
const relevantChunks = await retrieveRelevantChunks(
  message.trim(),
  business._id
);

const knowledgeContext = relevantChunks
  .map(
    (chunk, index) =>
      `Source ${index + 1}: ${chunk.originalName}\n${chunk.text}`
  )
  .join("\n\n");

// Generate the AI response before changing stored conversation data.
const reply = await generateAIResponse(
  contextMessages,
  business.name,
  knowledgeContext
);

if (typeof reply !== "string" || !reply.trim()) {
  throw new Error("AI returned an empty response");
}

// Update conversation only after successful AI generation.
if (
  conversation.messages.length === 0 ||
  conversation.title === "New Conversation"
) {
  conversation.title = message.trim().slice(0, 60);
}

conversation.messages.push(userMessage);

conversation.messages.push({
  role: "assistant",
  content: reply.trim(),
});

// Retain the latest 100 messages.
conversation.messages = conversation.messages.slice(-100);

await conversation.save();

    return res.status(200).json({
      message: "AI response generated successfully",
      conversationId: conversation._id,
      title: conversation.title,
      reply,
    });
  } catch (error) {
    console.error("Chat controller error:", error);

    if (error.status === 401) {
      return res.status(502).json({
        message: "DeepSeek authentication failed. Check your API key.",
      });
    }

    if (error.status === 402) {
      return res.status(503).json({
        message: "DeepSeek account balance is insufficient. Check your API balance.",
      });
    }

    if (error.status === 429) {
      return res.status(503).json({
        message: "DeepSeek rate limit reached. Please try again shortly.",
      });
    }

    return res.status(500).json({
      message: "AI service failed. Check the backend terminal.",
    });
  }
};

// GET /api/chat/history
// Retained for compatibility with the existing frontend
export const getChatHistory = getConversations;
