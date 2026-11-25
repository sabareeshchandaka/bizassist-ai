
import WidgetConfig from "../models/WidgetConfig.js";
import WidgetConversation from "../models/WidgetConversation.js";
import Business from "../models/Business.js";

import retrieveRelevantChunks from "../services/retrievalService.js";
import generateAIResponse from "../services/aiService.js";

const isAllowedOrigin = (origin, allowedDomains) => {
  if (!origin) return false;

  let hostname;

  try {
    hostname = new URL(origin).hostname.toLowerCase();
  } catch {
    return false;
  }

  if (
    process.env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1"].includes(hostname)
  ) {
    return true;
  }

  return allowedDomains.includes(hostname);
};

// GET /api/public-chat/config/:widgetId
export const getPublicWidgetConfig = async (req, res) => {
  try {
    const { widgetId } = req.params;

    if (!/^[a-f0-9]{32}$/i.test(widgetId)) {
      return res.status(400).json({
        message: "Invalid widget ID",
      });
    }

    const config = await WidgetConfig.findOne({
      widgetId,
      enabled: true,
    }).select(
      "widgetId assistantName welcomeMessage primaryColor allowedDomains enabled"
    );

    if (!config) {
      return res.status(404).json({
        message: "Widget not found or disabled",
      });
    }

    const origin = req.get("origin");

    if (!isAllowedOrigin(origin, config.allowedDomains || [])) {
      return res.status(403).json({
        message: "This website is not authorized to use this widget",
      });
    }

    return res.status(200).json({
      success: true,
      config: {
        assistantName: config.assistantName,
        welcomeMessage: config.welcomeMessage,
        primaryColor: config.primaryColor,
      },
    });
  } catch (error) {
    console.error("[PUBLIC WIDGET CONFIG] Error:", error.message);

    return res.status(500).json({
      message: "Unable to load widget configuration",
    });
  }
};

// POST /api/public-chat/message
export const sendPublicMessage = async (req, res) => {
  try {
    const { widgetId, visitorId, messages } = req.body;

    // Validate widget ID.
    if (
      typeof widgetId !== "string" ||
      !/^[a-f0-9]{32}$/i.test(widgetId)
    ) {
      return res.status(400).json({
        message: "Invalid widget ID",
      });
    }

    // Validate visitor session ID.
    if (
      typeof visitorId !== "string" ||
      !/^[a-f0-9-]{36}$/i.test(visitorId)
    ) {
      return res.status(400).json({
        message: "Invalid visitor session",
      });
    }

    // Validate messages.
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 12
    ) {
      return res.status(400).json({
        message: "Invalid conversation messages",
      });
    }

    const validMessages = messages.every(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0 &&
        message.content.length <= 2000
    );

    if (!validMessages) {
      return res.status(400).json({
        message: "One or more messages are invalid",
      });
    }

    const latestMessage = messages[messages.length - 1];

    if (latestMessage.role !== "user") {
      return res.status(400).json({
        message: "The latest message must be from the visitor",
      });
    }

    // Find widget configuration.
    const config = await WidgetConfig.findOne({
      widgetId,
      enabled: true,
    });

    if (!config) {
      return res.status(404).json({
        message: "This AI assistant is unavailable",
      });
    }

    // Verify website origin.
    const origin = req.get("origin");

    if (!isAllowedOrigin(origin, config.allowedDomains || [])) {
      return res.status(403).json({
        message: "This website is not authorized to use this widget",
      });
    }

    // Find the business that owns this widget.
    const business = await Business.findById(config.business);

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    // Retrieve business-specific knowledge.
    console.log("[PUBLIC CHAT] Retrieving business knowledge...");

    const relevantChunks = await retrieveRelevantChunks(
      latestMessage.content,
      business._id
    );

    const knowledgeContext = relevantChunks
      .map(
        (chunk, index) =>
          `Document ${index + 1}: ${chunk.text}`
      )
      .join("\n\n");

    console.log(
      "[PUBLIC CHAT] Retrieved chunks:",
      relevantChunks.length
    );

    // Generate AI response.
    const reply = await generateAIResponse(
      messages,
      business.name,
      knowledgeContext
    );

    // Save the visitor question and AI response.
    const conversation = await WidgetConversation.findOneAndUpdate(
      {
        business: business._id,
        widgetId,
        visitorId,
      },
      {
        $setOnInsert: {
          business: business._id,
          widgetId,
          visitorId,
          firstMessage: latestMessage.content.trim(),
          status: "active",
        },
        $push: {
          messages: {
            $each: [
              {
                role: "user",
                content: latestMessage.content.trim(),
              },
              {
                role: "assistant",
                content: reply,
              },
            ],
          },
        },
        $inc: {
          messageCount: 2,
          userMessageCount: 1,
          assistantMessageCount: 1,
        },
        $set: {
          lastMessageAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    console.log(
      "[PUBLIC CHAT] Conversation saved:",
      conversation._id.toString()
    );

    return res.status(200).json({
      success: true,
      reply,
      assistantName: config.assistantName,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("[PUBLIC CHAT] Error:", error.message);

    return res.status(500).json({
      message: "The AI assistant could not process your message",
    });
  }
};
