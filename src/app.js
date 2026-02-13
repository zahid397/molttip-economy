const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const rateLimiter = require("./middleware/rateLimit");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const logger = require("./config/logger");

const app = express();

app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Allowed origins (dynamic + fallbacks)
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://molttip-economy.vercel.app",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, Postman)
      if (!origin) return callback(null, true);

      // In development, allow all origins (easier testing)
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log rejected origin for debugging
      logger.warn(`CORS blocked origin: ${origin}`);

      // Reject with false (standard CORS error) instead of an error object
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser
app.use(express.json({ limit: "1mb" }));

// Logger
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// Rate limit only API routes
app.use("/api", rateLimiter);

// Routes
app.use("/api/health", require("./routes/health.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/agents", require("./routes/agent.routes"));
app.use("/api/posts", require("./routes/post.routes"));
app.use("/api/comments", require("./routes/comment.routes"));
app.use("/api/tips", require("./routes/tip.routes"));
app.use("/api/leaderboard", require("./routes/leaderboard.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MoltTip API is running 🚀",
  });
});

// Not found handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
