
import { pipeline } from "@huggingface/transformers";

let extractorPromise = null;

const getExtractor = async () => {
  if (!extractorPromise) {
    console.log("[Embedding] Loading MiniLM model...");

    extractorPromise = pipeline(
      "feature-extraction",
      "onnx-community/all-MiniLM-L6-v2-ONNX"
    )
      .then((extractor) => {
        console.log("[Embedding] Model loaded successfully!");
        return extractor;
      })
      .catch((error) => {
        console.error("[Embedding] Model loading failed:", error);
        extractorPromise = null;
        throw error;
      });
  }

  return extractorPromise;
};

export const generateEmbedding = async (text) => {
  console.log("[Embedding] Generating query embedding...");

  const extractor = await getExtractor();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  const embedding = output.tolist()[0];

  console.log("[Embedding] Vector dimensions:", embedding.length);

  if (embedding.length !== 384) {
    throw new Error(
      `Expected 384 dimensions, received ${embedding.length}`
    );
  }

  return embedding;
};

export const generateEmbeddings = async (texts) => {
  console.log(`[Embedding] Processing ${texts.length} chunks...`);

  const extractor = await getExtractor();
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += 16) {
    const batch = texts.slice(i, i + 16);

    console.log(
      `[Embedding] Processing batch ${Math.floor(i / 16) + 1}...`
    );

    const output = await extractor(batch, {
      pooling: "mean",
      normalize: true,
    });

    allEmbeddings.push(...output.tolist());
  }

  console.log("[Embedding] All embeddings generated!");

  return allEmbeddings;
};
