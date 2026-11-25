
import mongoose from "mongoose";

import DocumentChunk from "../models/DocumentChunk.js";
import { generateEmbedding } from "./embeddingService.js";

const EMBEDDING_DIMENSIONS = 384;

const retrieveRelevantChunks = async (question, businessId) => {
  try {
    // Validate the business workspace.
    if (!mongoose.isValidObjectId(businessId)) {
      throw new Error("Invalid business workspace.");
    }

    // Validate the question.
    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      throw new Error("A valid question is required.");
    }

    console.log("\n========== RAG RETRIEVAL STARTED ==========");
    console.log("[RAG] Business ID:", businessId.toString());

    // Generate the question embedding.
    const queryEmbedding = await generateEmbedding(
      question.trim()
    );

    // Validate the generated vector.
    if (
      !Array.isArray(queryEmbedding) ||
      queryEmbedding.length !== EMBEDDING_DIMENSIONS ||
      !queryEmbedding.every(Number.isFinite)
    ) {
      throw new Error("Invalid query embedding generated.");
    }

    // Check whether this business has indexed chunks.
    const chunkCount = await DocumentChunk.countDocuments({
      business: businessId,
    });

    if (chunkCount === 0) {
      console.log("[RAG] No chunks found.");
      console.log("========== RAG RETRIEVAL FINISHED ==========\n");
      return [];
    }

    // Search only this business's documents.
    const results = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: "bizassist_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 5,
          filter: {
            business: businessId,
          },
        },
      },
      {
        $project: {
          text: 1,
          originalName: 1,
          chunkIndex: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

    console.log("[RAG] Retrieved chunks:", results.length);
    console.log("========== RAG RETRIEVAL FINISHED ==========\n");

    return results;
  } catch (error) {
    console.error("[RAG] Retrieval failed:", error.message);
    throw error;
  }
};

export default retrieveRelevantChunks;
