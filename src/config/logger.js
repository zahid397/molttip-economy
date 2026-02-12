const winston = require('winston');
const { nodeEnv } = require('./env');

const logger = winston.createLogger({
  level: nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: nodeEnv === 'production' ? winston.format.simple() : winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
  ] // Note: Removed file transports since Render free tier wipes the filesystem on sleep
});
module.exports = logger;
