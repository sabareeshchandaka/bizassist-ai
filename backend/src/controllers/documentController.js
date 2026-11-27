
import mongoose from "mongoose";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";

import chunkText from "../utils/textChunker.js";
import { generateEmbeddings } from "../services/embeddingService.js";
import path from "path"

const MAX_PDF_PAGES = 100;
const MAX_EXTRACTED_CHARACTERS = 500_000;

const createProcessingError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const checkTextSize = (text) => {
  if (text.length > MAX_EXTRACTED_CHARACTERS) {
    throw createProcessingError(
      "This document contains too much text. Please upload a smaller document."
    );
  }
};

const extractDocumentText = async (file) => {
  const extension = path
      .extname(path.basename(file.originalname))
      .toLowerCase();

  if (extension === ".txt") {
    const text = file.buffer.toString("utf-8");
    checkTextSize(text);
    return text;
  }

  if (extension === ".pdf") {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(file.buffer),
      useSystemFonts: true,
    });

    try {
      const pdfDocument = await loadingTask.promise;

      if (pdfDocument.numPages > MAX_PDF_PAGES) {
        throw createProcessingError(
          `PDF files cannot contain more than ${MAX_PDF_PAGES} pages.`
        );
      }

      const pages = [];
      let totalCharacters = 0;

      for (
        let pageNumber = 1;
        pageNumber <= pdfDocument.numPages;
        pageNumber++
      ) {
        const page = await pdfDocument.getPage(pageNumber);

        try {
          const textContent = await page.getTextContent();

          const pageText = textContent.items
            .map((item) => item.str || "")
            .join(" ");

          totalCharacters += pageText.length;

          if (totalCharacters > MAX_EXTRACTED_CHARACTERS) {
            throw createProcessingError(
              "This PDF contains too much text. Please upload a smaller document."
            );
          }

          pages.push(pageText);
        } finally {
          page.cleanup();
        }
      }

      return pages.join("\n");
    } finally {
      await loadingTask.destroy();
    }
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    checkTextSize(result.value);

    return result.value;
  }

  throw createProcessingError("Unsupported document format.");
};



const sanitizeFileName = (fileName) => {
  return path
    .basename(fileName)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, 255);
};


// POST /api/documents/upload

export const uploadDocument = async (req, res) => {
  let session;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a document to upload.",
      });
    }
const safeOriginalName = sanitizeFileName(
  req.file.originalname
);

if (!safeOriginalName) {
  return res.status(400).json({
    success: false,
    message: "Invalid document filename.",
  });
}
    const businessId = req.user.business;

    if (!businessId || !mongoose.isValidObjectId(businessId)) {
      return res.status(400).json({
        success: false,
        message: "A valid business workspace is required.",
      });
    }

    // Extract and process the document before opening a transaction.
    const extractedText = await extractDocumentText(req.file);
    const cleanedText = extractedText.trim();

    if (!cleanedText) {
      return res.status(400).json({
        success: false,
        message: "No readable text was found in this document.",
      });
    }

    const chunks = chunkText(cleanedText);

    if (!chunks.length) {
      return res.status(400).json({
        success: false,
        message: "Unable to create document chunks.",
      });
    }

    // Generate embeddings before opening the transaction.
    const embeddings = await generateEmbeddings(chunks);

    if (
      !Array.isArray(embeddings) ||
      embeddings.length !== chunks.length
    ) {
      throw new Error("Embedding count does not match chunk count.");
    }

    // Validate every embedding.
    if (
      embeddings.some(
        (embedding) =>
          !Array.isArray(embedding) ||
          embedding.length !== 384 ||
          !embedding.every(Number.isFinite)
      )
    ) {
      throw new Error("One or more document embeddings are invalid.");
    }

    // Start the database transaction.
    session = await mongoose.startSession();

    let createdDocument;

    await session.withTransaction(async () => {
      // Save the document.
      const documents = await Document.create(
        [
          {
            business: businessId,
            uploadedBy: req.user._id,
            originalName: safeOriginalName,
            mimeType: req.file.mimetype,
            size: req.file.size,
            content: cleanedText,
            status: "processed",
          },
        ],
        { session }
      );

      createdDocument = documents[0];

      // Prepare searchable chunks.
      const chunkRecords = chunks.map((text, index) => ({
        business: businessId,
        document: createdDocument._id,
        originalName: safeOriginalName,
        chunkIndex: index,
        text,
        embedding: embeddings[index],
      }));

      // Save all chunks within the same transaction.
      await DocumentChunk.insertMany(chunkRecords, {
        session,
        ordered: true,
      });
    });

    return res.status(201).json({
      success: true,
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
    console.error("Document upload error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 400
          ? error.message
          : "Unable to process and index this document.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
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
  let session;

  try {
    const { id } = req.params;
    const businessId = req.user.business;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID.",
      });
    }

    if (!businessId || !mongoose.isValidObjectId(businessId)) {
      return res.status(400).json({
        success: false,
        message: "A valid business workspace is required.",
      });
    }

    session = await mongoose.startSession();

    let deletedDocument = null;

    await session.withTransaction(async () => {
      // Find and delete only a document belonging to this business.
      deletedDocument = await Document.findOneAndDelete(
        {
          _id: id,
          business: businessId,
        },
        { session }
      );

      if (!deletedDocument) {
        return;
      }

      // Delete its searchable chunks in the same transaction.
      await DocumentChunk.deleteMany(
        {
          document: deletedDocument._id,
          business: businessId,
        },
        { session }
      );
    });

    if (!deletedDocument) {
      return res.status(404).json({
        success: false,
        message: "Document not found in your workspace.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document and its indexed chunks deleted successfully.",
    });
  } catch (error) {
    console.error("Delete document error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete document.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
