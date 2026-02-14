const { successResponse } = require('../utils/response');

const healthCheck = (req, res) => {
  successResponse(res, {
    status: 'OK',
    mode: 'memory-demo',
    timestamp: new Date().toISOString(),
    ai: 'Groq->Gemini->Claude fallback enabled',
  });
};

module.exports = { healthCheck };
