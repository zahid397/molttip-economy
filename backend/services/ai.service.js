const callGroq = require('./groq.service');
const callGemini = require('./gemini.service');
const callClaude = require('./claude.service');
const logger = require('../config/logger');

const MOCK_REPLY = '🤖 Demo AI Mode: Backend AI provider unavailable. MoltTip lets creators earn via Web3 tipping!';

const getAIResponse = async (message) => {
  // Try Groq first
  try {
    logger.debug('Trying Groq...');
    return await callGroq(message);
  } catch (err) {
    logger.warn('Groq failed:', err.message);
  }

  // Then Gemini
  try {
    logger.debug('Trying Gemini...');
    return await callGemini(message);
  } catch (err) {
    logger.warn('Gemini failed:', err.message);
  }

  // Then Claude
  try {
    logger.debug('Trying Claude...');
    return await callClaude(message);
  } catch (err) {
    logger.warn('Claude failed:', err.message);
  }

  // Fallback mock
  logger.info('All AI providers failed, returning mock reply');
  return MOCK_REPLY;
};

module.exports = { getAIResponse };
