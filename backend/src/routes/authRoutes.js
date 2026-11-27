
import express from "express";

import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  loginLimiter,
  registerLimiter,
} from "../middleware/rateLimiters.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/requestSchema.js";

const router = express.Router();

// Public routes
router.post("/register", registerLimiter, validateRequest(registerSchema), register);
router.post("/login", loginLimiter,  validateRequest(loginSchema), login);

// Protected profile routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, validateRequest(updateProfileSchema), updateProfile);
// Protected password route
router.put("/change-password", authMiddleware, validateRequest(changePasswordSchema), changePassword);


export default router;
