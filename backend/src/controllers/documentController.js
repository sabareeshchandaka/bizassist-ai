
import mongoose from "mongoose";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";

import chunkText from "../utils/textChunker.js";
import { generateEmbeddings } from "../services/embeddingService.js";

const extractDocumentText = async (file) => {
  const extension = file.originalname
    .split(".")
    .pop()
    .toLowerCase();

  if (extension === "txt") {
    return file.buffer.toString("utf-8");
  }

  if (extension === "pdf") {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(file.buffer),
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();

      pages.push(
        textContent.items.map((item) => item.str || "").join(" ")
      );
    }

    return pages.join("\n");
  }

  if (extension === "docx") {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return result.value;
  }

  throw new Error("Unsupported document format.");
};

// POST /api/documents/upload
export const uploadDocument = async (req, res) => {
  let createdDocument = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a document to upload.",
      });
    }

    const businessId = req.user.business;

    if (!businessId || !mongoose.isValidObjectId(businessId)) {
      return res.status(400).json({
        message: "A valid business workspace is required.",
      });
    }

    const extractedText = await extractDocumentText(req.file);
    const cleanedText = extractedText.trim();

    if (!cleanedText) {
      return res.status(400).json({
        message: "No readable text was found in this document.",
      });
    }

    // Split the extracted text into smaller pieces.
    const chunks = chunkText(cleanedText);

    if (chunks.length === 0) {
      return res.status(400).json({
        message: "Unable to create document chunks.",
      });
    }

    console.log(`Generating embeddings for ${chunks.length} chunks...`);

    // Generate one vector for each chunk.
    const embeddings = await generateEmbeddings(chunks);

    if (embeddings.length !== chunks.length) {
      throw new Error("Embedding count does not match chunk count.");
    }

    // Save the original document.
    createdDocument = await Document.create({
      business: businessId,
      uploadedBy: req.user._id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      content: cleanedText,
      status: "processed",
    });

    // Save chunks and embeddings separately.
    const chunkRecords = chunks.map((text, index) => ({
      business: businessId,
      document: createdDocument._id,
      originalName: req.file.originalname,
      chunkIndex: index,
      text,
      embedding: embeddings[index],
    }));

    await DocumentChunk.insertMany(chunkRecords);

    return res.status(201).json({
      message: "Document uploaded and indexed successfully.",
      document: {
        _id: createdDocument._id,
        originalName: createdDocument.originalName,
        size: createdDocument.size,
        status: createdDocument.status,
        chunkCount: chunks.length,
        createdAt: createdDocument.createdAt,
      },
    });
  } catch (error) {
    console.error("Document upload error:", error);

    // Avoid leaving an original document without its chunks.
    if (createdDocument) {
      await DocumentChunk.deleteMany({
        document: createdDocument._id,
      }).catch(() => {});

      await Document.findByIdAndDelete(
        createdDocument._id
      ).catch(() => {});
    }

    return res.status(500).json({
      message: "Unable to process and index this document.",
    });
  }
};

// GET /api/documents
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      business: req.user.business,
    })
      .select("-content")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve documents.",
    });
  }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid document ID.",
      });
    }

    const document = await Document.findOneAndDelete({
      _id: id,
      business: req.user.business,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found in your workspace.",
      });
    }

    // Also remove all searchable chunks belonging to this document.
    await DocumentChunk.deleteMany({
      document: document._id,
      business: req.user.business,
    });

    return res.status(200).json({
      message: "Document and its indexed chunks deleted successfully.",
    });
  } catch (error) {
    console.error("Delete document error:", error.message);

    return res.status(500).json({
      message: "Unable to delete document.",
    });
  }
};
