
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getAnalyticsOverview,
  getWidgetConversations,
  getWidgetConversationById,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/overview", getAnalyticsOverview);

router.get("/conversations", getWidgetConversations);

router.get(
  "/conversations/:conversationId",
  getWidgetConversationById
);

export default router;
