const { getAIResponse } = require('../services/ai.service');
const { successResponse, errorResponse } = require('../utils/response');

const chat = async (req, res) => {
  const { message } = req.body;
  if (!message) return errorResponse(res, 'Message is required', 400);

  try {
    const reply = await getAIResponse(message);
    successResponse(res, { reply });
  } catch (err) {
    errorResponse(res, 'AI service error', 500);
  }
};

module.exports = { chat };
