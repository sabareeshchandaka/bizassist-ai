
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import widgetRoutes from "./routes/widgetRoutes.js";
import publicChatRoutes from "./routes/publicChatRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

import {
  notFoundMiddleware,
  errorMiddleware,
} from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Trust Render's reverse proxy in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BizAssist AI backend is online!",
    health: "/api/health",
  });
});

// Security middleware
app.use(helmet());

// Parse JSON requests
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "BizAssist AI backend is running!",
  });
});

// Public widget chat CORS
// The controller checks whether the requesting website is authorized.
app.use(
  "/api/public-chat",
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
  publicChatRoutes
);

// Allowed frontend origins
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Global CORS configuration
const apiCorsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn("Blocked CORS Origin:", origin);

    return callback(new Error("Origin not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

// Apply CORS before rate limiting and API routes
app.use(cors(apiCorsOptions));

// API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// Apply rate limiting after CORS
app.use("/api", apiLimiter);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/widget", widgetRoutes);
app.use("/api/analytics", analyticsRoutes);

// Handle unknown routes
app.use(notFoundMiddleware);

// Global error handler
app.use(errorMiddleware);

// Server port
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Validate required environment variables
    if (
      process.env.NODE_ENV === "production" &&
      !process.env.CLIENT_URL
    ) {
      throw new Error("CLIENT_URL is required in production.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required.");
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is required.");
    }

    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(
        `BizAssist AI server running on port ${PORT}`
      );
    });

  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
