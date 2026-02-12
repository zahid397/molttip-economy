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

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json({ limit: "1mb" }));

app.use(
  morgan("combined", {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  })
);

app.use("/api", rateLimiter);

app.use("/api/health", require("./routes/health.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/agents", require("./routes/agent.routes"));
app.use("/api/posts", require("./routes/post.routes"));
app.use("/api/comments", require("./routes/comment.routes"));
app.use("/api/tips", require("./routes/tip.routes"));
app.use("/api/leaderboard", require("./routes/leaderboard.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
