
import WidgetConfig from "../models/WidgetConfig.js";
import WidgetConversation from "../models/WidgetConversation.js";
import Business from "../models/Business.js";

import retrieveRelevantChunks from "../services/retrievalService.js";
import generateAIResponse from "../services/aiService.js";

const MAX_HISTORY_MESSAGES = 10;

const isAllowedOrigin = (origin, allowedDomains) => {
  if (!origin) return false;

  let parsedOrigin;

  try {
    parsedOrigin = new URL(origin);
  } catch {
    return false;
  }

  if (!["https:", "http:"].includes(parsedOrigin.protocol)) {
    return false;
  }

  const hostname = parsedOrigin.hostname.toLowerCase();

  // Development-only localhost support.
  if (
    process.env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1"].includes(hostname)
  ) {
    return true;
  }

  return Array.isArray(allowedDomains) &&
    allowedDomains.includes(hostname);
};

// GET /api/public-chat/config/:widgetId
export const getPublicWidgetConfig = async (req, res) => {
  try {
    const { widgetId } = req.params;

    if (!/^[a-f0-9]{32}$/i.test(widgetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid widget ID.",
      });
    }

    const config = await WidgetConfig.findOne({
      widgetId,
      enabled: true,
    }).select(
      "widgetId assistantName welcomeMessage primaryColor allowedDomains"
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Widget not found or disabled.",
      });
    }

    const origin = req.get("origin");

    if (!isAllowedOrigin(origin, config.allowedDomains || [])) {
      return res.status(403).json({
        success: false,
        message: "This website is not authorized to use this widget.",
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
    console.error("[PUBLIC WIDGET CONFIG]", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load widget configuration.",
    });
  }
};

// POST /api/public-chat/message
export const sendPublicMessage = async (req, res) => {
  try {
    const {
      widgetId,
      visitorId,
      latestMessage,
    } = req.publicChat;

    // Verify the widget exists and is enabled.
    const config = await WidgetConfig.findOne({
      widgetId,
      enabled: true,
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "This AI assistant is unavailable.",
      });
    }

    // Verify the requesting website.
    const origin = req.get("origin");

    if (!isAllowedOrigin(origin, config.allowedDomains || [])) {
      return res.status(403).json({
        success: false,
        message: "This website is not authorized to use this widget.",
      });
    }

    // Find the business associated with this widget.
    const business = await Business.findById(config.business);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    // Load trusted conversation history from MongoDB.
    // Do not trust assistant messages supplied by the browser.
    const existingConversation = await WidgetConversation.findOne({
      business: business._id,
      widgetId,
      visitorId,
    }).select("messages");

    const previousMessages = (
      existingConversation?.messages || []
    )
      .filter(
        (message) =>
          ["user", "assistant"].includes(message.role) &&
          typeof message.content === "string"
      )
      .slice(-MAX_HISTORY_MESSAGES)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const conversationMessages = [
      ...previousMessages,
      {
        role: "user",
        content: latestMessage,
      },
    ];

    // Retrieve only this business's knowledge.
    const relevantChunks = await retrieveRelevantChunks(
      latestMessage,
      business._id
    );

    const knowledgeContext = relevantChunks
      .map(
        (chunk, index) =>
          `Document ${index + 1}: ${chunk.text}`
      )
      .join("\n\n");

    // Generate the AI response.
    const reply = await generateAIResponse(
      conversationMessages,
      business.name,
      knowledgeContext
    );

    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error("AI returned an invalid response.");
    }

    // Save the visitor message and assistant response.
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
          firstMessage: latestMessage,
          status: "active",
        },
        $push: {
          messages: {
            $each: [
              {
                role: "user",
                content: latestMessage,
              },
              {
                role: "assistant",
                content: reply.trim(),
              },
            ],
            $slice: -100,
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
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      reply: reply.trim(),
      assistantName: config.assistantName,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("[PUBLIC CHAT]", error.message);

    return res.status(500).json({
      success: false,
      message: "The AI assistant could not process your message.",
    });
  }
};
