
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getWidgetConfig,
  updateWidgetConfig,
} from "../controllers/widgetController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/config", getWidgetConfig);
router.put("/config", updateWidgetConfig);

export default router;
