
import DocumentChunk from "../models/DocumentChunk.js";
import { generateEmbedding } from "./embeddingService.js";

const retrieveRelevantChunks = async (question, businessId) => {
  try {
    console.log("\n========== RAG RETRIEVAL STARTED ==========");
    console.log("[RAG] Question:", question);
    console.log("[RAG] Business ID:", businessId.toString());

    // Step 1: Generate embedding for the user's question
    console.log("[RAG] Generating query embedding...");

    const queryEmbedding = await generateEmbedding(question);

    console.log("[RAG] Query embedding generated.");
    console.log("[RAG] Vector dimensions:", queryEmbedding.length);

    // Step 2: Check whether document chunks exist for this business
    const chunkCount = await DocumentChunk.countDocuments({
      business: businessId,
    });

    console.log("[RAG] Total document chunks:", chunkCount);

    if (chunkCount === 0) {
      console.log("[RAG] No document chunks found for this business.");
      console.log("========== RAG RETRIEVAL FINISHED ==========\n");
      return [];
    }

    // Step 3: Search MongoDB Atlas Vector Search
    console.log("[RAG] Searching MongoDB Vector Search...");

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

    results.forEach((chunk, index) => {
      console.log(`[RAG] Result ${index + 1}:`, {
        document: chunk.originalName,
        chunkIndex: chunk.chunkIndex,
        score: chunk.score,
      });
    });

    console.log("========== RAG RETRIEVAL FINISHED ==========\n");

    return results;
  } catch (error) {
    console.error("\n[RAG] RETRIEVAL FAILED:", error.message);
    throw error;
  }
};

export default retrieveRelevantChunks;
