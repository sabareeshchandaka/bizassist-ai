
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

import {
  getWidgetConfig,
  updateWidgetConfig,
} from "../controllers/widgetController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/config", getWidgetConfig);

router.put(
  "/config",
  authorizeRoles("owner"),
  updateWidgetConfig
);

export default router;
