
import { generateEmbedding } from "./src/services/embeddingService.js";

try {
  console.log("Starting embedding test...");

  const vector = await generateEmbedding(
    "Our SEO packages start at Rs. 5000 per month."
  );

  console.log("SUCCESS!");
  console.log("Vector length:", vector.length);
  console.log("First five values:", vector.slice(0, 5));
} catch (error) {
  console.error("TEST FAILED:", error);
  process.exitCode = 1;
}
