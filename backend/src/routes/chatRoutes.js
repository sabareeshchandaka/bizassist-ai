
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  sendMessage,
  getChatHistory,
  createConversation,
  getConversations,
  getConversation,
  renameConversation,
  deleteConversation,
} from "../controllers/chatController.js";
import { chatLimiter } from "../middleware/rateLimiters.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  chatMessageSchema,
  renameConversationSchema,
  mongoIdSchema,
} from "../validators/requestSchema.js";
const router = express.Router();

// All chat endpoints require authentication
router.use(authMiddleware);

// Conversation management
router.post("/conversations", createConversation);
router.get("/conversations", getConversations);
router.get("/conversations/:id", validateRequest(mongoIdSchema, "params"),getConversation);
router.patch("/conversations/:id",  validateRequest(mongoIdSchema, "params"),validateRequest(renameConversationSchema), renameConversation);
router.delete("/conversations/:id", validateRequest(mongoIdSchema, "params"),deleteConversation);

// Chat messaging
router.post("/message", sendMessage);
// Chat messaging
router.post("/message", chatLimiter, validateRequest(chatMessageSchema), sendMessage);
// Backward compatibility
router.get("/history", getChatHistory);

export default router;
