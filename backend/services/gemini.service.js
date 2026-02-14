const axios = require('axios');
const { geminiApiKey } = require('../config/env');
const logger = require('../config/logger');

const callGemini = async (message) => {
  if (!geminiApiKey) throw new Error('GEMINI_API_KEY missing');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
  const response = await axios.post(
    url,
    {
      contents: [{ parts: [{ text: message }] }],
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    }
  );
  return response.data.candidates[0].content.parts[0].text;
};

module.exports = callGemini;
