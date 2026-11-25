
import express from "express";

import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../controllers/documentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import validateUploadedFile from "../middleware/validateUploadedFile.js";
import uploadErrorMiddleware from "../middleware/uploadErrorMiddleware.js";
const router = express.Router();

router.use(authMiddleware);

router.post(
  "/upload",
  upload.single("document"),
  uploadErrorMiddleware,
  validateUploadedFile,
  uploadDocument
);

router.get("/", getDocuments);
router.delete("/:id", deleteDocument);

export default router;
