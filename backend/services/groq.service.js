const axios = require('axios');
const { groqApiKey } = require('../config/env');
const logger = require('../config/logger');

const callGroq = async (message) => {
  if (!groqApiKey) throw new Error('GROQ_API_KEY missing');
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: message }],
      max_tokens: 300,
    },
    {
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );
  return response.data.choices[0].message.content;
};

module.exports = callGroq;
