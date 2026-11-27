
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
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BizAssist AI backend is online!",
    health: "/api/health",
  });
});
if(process.env.NODE_ENV === "production"){
  app.set("trust proxy",1);
}

app.use(helmet());

app.use(express.json({ limit: "1mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "BizAssist AI backend is running!",
  });
});

// Public widget chat.
// This route accepts browser requests from authorized
// business websites. The controller checks the Origin.
app.use(
  "/api/public-chat",
  cors({
    origin: true,
    methods: ["GET","POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
  publicChatRoutes
);

// Private APIs: only your frontend origin.

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const apiCorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
};

app.use(cors(apiCorsOptions));


const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header,
    // such as server-to-server requests.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/widget", widgetRoutes);
app.use("/api/analytics", analyticsRoutes);

// Unknown routes
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
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
    await connectDB();

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
