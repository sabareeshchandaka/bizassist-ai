
import express from "express";
import rateLimit from "express-rate-limit";

import {
  getPublicWidgetConfig,
  sendPublicMessage,
} from "../controllers/publicChatController.js";

import validatePublicChat from "../middleware/validatePublicChat.js";

const router = express.Router();

const publicChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages. Please try again later.",
  },
});

const publicConfigLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many configuration requests. Please try again later.",
  },
});

router.get(
  "/config/:widgetId",
  publicConfigLimiter,
  getPublicWidgetConfig
);

router.post(
  "/message",
  publicChatLimiter,
  validatePublicChat,
  sendPublicMessage
);

export default router;
