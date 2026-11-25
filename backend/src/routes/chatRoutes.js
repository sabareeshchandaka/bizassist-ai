
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

const router = express.Router();

// All chat endpoints require authentication
router.use(authMiddleware);

// Conversation management
router.post("/conversations", createConversation);
router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversation);
router.patch("/conversations/:id", renameConversation);
router.delete("/conversations/:id", deleteConversation);

// Chat messaging
router.post("/message", sendMessage);

// Backward compatibility
router.get("/history", getChatHistory);

export default router;
