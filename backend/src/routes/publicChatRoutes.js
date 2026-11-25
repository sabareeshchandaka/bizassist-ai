
import express from "express";
import rateLimit from "express-rate-limit";

import {
  getPublicWidgetConfig,
  sendPublicMessage,
} from "../controllers/publicChatController.js";

const router = express.Router();

const publicChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many messages. Please try again later.",
  },
});

const publicConfigLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.get(
  "/config/:widgetId",
  publicConfigLimiter,
  getPublicWidgetConfig
);

router.post(
  "/message",
  publicChatLimiter,
  sendPublicMessage
);

export default router;
