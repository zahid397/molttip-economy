const winston = require('winston'); // (Not a dependency, but we'll create a simple logger)
// Simpler: just console + optional file? We'll use console for Render.

const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') console.debug('[DEBUG]', ...args);
  },
};

module.exports = logger;
