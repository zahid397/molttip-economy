const axios = require('axios');
const { claudeApiKey } = require('../config/env');
const logger = require('../config/logger');

const callClaude = async (message) => {
  if (!claudeApiKey) throw new Error('CLAUDE_API_KEY missing');
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [{ role: 'user', content: message }],
    },
    {
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );
  return response.data.content[0].text;
};

module.exports = callClaude;
