import mongoose from "mongoose";
import WidgetConversation from "../models/WidgetConversation.js";

export const getAnalyticsOverview = async (req, res) => {
  try {
    const businessId = req.user.business;

    // Calculate the last 7 days using UTC dates.
    const now = new Date();

    const todayStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    );

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

    // 1. Overall statistics.
    const overallStats = await WidgetConversation.aggregate([
      {
        $match: {
          business: businessId,
        },
      },
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          totalMessages: { $sum: "$messageCount" },
          totalUserMessages: { $sum: "$userMessageCount" },
          totalAIResponses: { $sum: "$assistantMessageCount" },
        },
      },
    ]);

    const totals = overallStats[0] || {
      totalConversations: 0,
      totalMessages: 0,
      totalUserMessages: 0,
      totalAIResponses: 0,
    };

    // 2. Conversations created during the last 7 days.
    const weeklyConversations =
      await WidgetConversation.countDocuments({
        business: businessId,
        createdAt: { $gte: sevenDaysAgo },
      });

    // 3. Daily conversation activity.
    const dailyActivity =
      await WidgetConversation.aggregate([
        {
          $match: {
            business: businessId,
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            conversations: { $sum: 1 },
            visitorMessages: {
              $sum: "$userMessageCount",
            },
            aiResponses: {
              $sum: "$assistantMessageCount",
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

    // Fill dates with zero values when no conversations occurred.
    const activityMap = new Map(
      dailyActivity.map((item) => [item._id, item])
    );

    const dailyStats = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setUTCDate(date.getUTCDate() + i);

      const dateKey = date.toISOString().slice(0, 10);
      const existing = activityMap.get(dateKey);

      dailyStats.push({
        date: dateKey,
        conversations: existing?.conversations || 0,
        visitorMessages: existing?.visitorMessages || 0,
        aiResponses: existing?.aiResponses || 0,
      });
    }

    // 4. Most frequently asked opening questions.
    const popularQuestions =
      await WidgetConversation.aggregate([
        {
          $match: {
            business: businessId,
            firstMessage: { $nin: ["", null] },
          },
        },
        {
          $group: {
            _id: {
              $toLower: {
                $trim: {
                  input: "$firstMessage",
                },
              },
            },
            originalQuestion: {
              $first: "$firstMessage",
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            _id: 0,
            question: "$originalQuestion",
            count: 1,
          },
        },
      ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totalConversations: totals.totalConversations,
        totalMessages: totals.totalMessages,
        totalVisitorMessages: totals.totalUserMessages,
        totalAIResponses: totals.totalAIResponses,
        weeklyConversations,
        dailyStats,
        popularQuestions,
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] Error:", error.message);

    return res.status(500).json({
      message: "Unable to load business analytics",
    });
  }
};

// GET /api/analytics/conversations

export const getWidgetConversations = async (req, res) => {
  try {
    const businessId = req.user.business;

    // 1. Validate pagination parameters
    const rawPage = Number(req.query.page ?? 1);
    const rawLimit = Number(req.query.limit ?? 10);

    if (
      !Number.isSafeInteger(rawPage) ||
      rawPage < 1 ||
      rawPage > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number.",
      });
    }

    if (
      !Number.isSafeInteger(rawLimit) ||
      rawLimit < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid page size.",
      });
    }

    const page = rawPage;
    const limit = Math.min(50, rawLimit);
    const skip = (page - 1) * limit;

    // 2. Validate search query
    const search = String(req.query.search || "").trim();

    if (search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search query cannot exceed 100 characters.",
      });
    }

    // Escape special regex characters
    const escapedSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // 3. Build business-specific database filter
    const filter = {
      business: businessId,
    };

    if (search) {
      filter.$or = [
        {
          firstMessage: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          visitorId: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    // 4. Get total matching conversations
    const totalConversations =
      await WidgetConversation.countDocuments(filter);

    // 5. Fetch paginated conversations
    const conversations = await WidgetConversation.find(filter)
      .select(
        "visitorId firstMessage messageCount userMessageCount assistantMessageCount lastMessageAt status createdAt"
      )
      .sort({
        lastMessageAt: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    // 6. Calculate pagination information
    const totalPages = Math.ceil(
      totalConversations / limit
    );

    // 7. Return response
    return res.status(200).json({
      success: true,
      conversations,
      pagination: {
        currentPage: page,
        totalPages,
        totalConversations,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });

  } catch (error) {
    console.error(
      "[CONVERSATION HISTORY] List error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load conversations",
    });
  }
};


// GET /api/analytics/conversations/:conversationId
export const getWidgetConversationById = async (req, res) => {
  try {
    const businessId = req.user.business;
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    // Business filter is essential: users must only access
    // conversations belonging to their own business.
    const conversation = await WidgetConversation.findOne({
      _id: conversationId,
      business: businessId,
    })
      .select(
        "visitorId firstMessage messages messageCount userMessageCount assistantMessageCount lastMessageAt status createdAt"
      )
      .lean();

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(
      "[CONVERSATION HISTORY] Detail error:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to load this conversation",
    });
  }
};
