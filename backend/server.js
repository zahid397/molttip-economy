const app = require('./app');
const { port, nodeEnv } = require('./config/env');
const logger = require('./config/logger');
const startAgentBot = require('./services/agentBot.service');

const server = app.listen(port, () => {
  logger.info(`Server running in ${nodeEnv} mode on port ${port}`);
  // Start agent bot after server is up
  startAgentBot();
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
