
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

import {
  getBusinessProfile,
  updateBusinessProfile,
} from "../controllers/businessController.js";

const router = express.Router();

// All business routes require authentication.
router.use(authMiddleware);

// All authenticated business users can view the profile.
router.get("/profile", getBusinessProfile);

// Only the business owner can update the profile.
router.put(
  "/profile",
  authorizeRoles("owner"),
  updateBusinessProfile
);

export default router;
