
const app = require('./app');
const { port, nodeEnv } = require('./config/env');
const logger = require('./config/logger');
const startAgentBot = require('./services/agentBot.service');

let server;

const startServer = async () => {
  try {
    server = app.listen(port, () => {
      logger.info(`🚀 Server running in ${nodeEnv} mode on port ${port}`);

      // Start agent bot (non-blocking)
      startAgentBot().catch(err => {
        logger.error('Agent bot failed to start:', err.message);
      });
    });
  } catch (err) {
    logger.error('Server startup failed:', err);
    process.exit(1);
  }
};

startServer();


// ===============================
// Graceful Shutdown Handling
// ===============================

// Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Render / Railway / Fly SIGTERM
process.on('SIGTERM', () => {
  logger.info('⚠️ SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      logger.info('✅ Server closed');
      process.exit(0);
    });
  }
});
