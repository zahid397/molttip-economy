const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { port, nodeEnv } = require('./config/env');

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

connectDB().then(() => {
  const server = app.listen(port, () => {
    logger.info(`🚀 MoltTip API running on port ${port} in ${nodeEnv} mode`);
  });

  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => process.exit(1));
  });
});
