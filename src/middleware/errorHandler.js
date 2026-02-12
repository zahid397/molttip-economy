const logger = require("../config/logger");
const { nodeEnv } = require("../config/env");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(nodeEnv === "development" && { stack: err.stack })
  });
};

module.exports = errorHandler;
