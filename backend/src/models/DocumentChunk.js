
import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Chunk index must be an integer.",
      },
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (values) =>
          values.length === 384 &&
          values.every(
            (value) => Number.isFinite(value)
          ),
        message: "Embedding must contain 384 valid numbers.",
      },
    },
  },
  { timestamps: true }
);

// A document cannot have duplicate chunk positions.
documentChunkSchema.index(
  { document: 1, chunkIndex: 1 },
  { unique: true }
);

// Helps retrieve and delete chunks within a business.
documentChunkSchema.index({
  business: 1,
  document: 1,
});

export default mongoose.model(
  "DocumentChunk",
  documentChunkSchema
);
