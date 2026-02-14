const { addTip } = require('../mock/tips.store');
const { getUserByAddress, getUserById, updateUserEarnings } = require('../mock/users.store');
const { getPostById } = require('../mock/posts.store');
const { addNotification } = require('../mock/notifications.store');
const { successResponse, errorResponse } = require('../utils/response');

const createTip = (req, res) => {
  const { recipientAddress, postId, amount } = req.body;
  if (!recipientAddress || !amount) return errorResponse(res, 'recipientAddress and amount required', 400);

  const recipient = getUserByAddress(recipientAddress);
  if (!recipient) return errorResponse(res, 'Recipient not found', 404);

  // Optional: verify post exists if postId provided
  if (postId) {
    const post = getPostById(postId);
    if (!post) return errorResponse(res, 'Post not found', 404);
  }

  const tip = addTip({
    fromUserId: req.user.id,
    toUserId: recipient.id,
    postId,
    amount: parseFloat(amount),
  });

  // Update recipient earnings
  updateUserEarnings(recipient.id, parseFloat(amount));

  // Create notification for recipient
  addNotification({
    userId: recipient.id,
    type: 'tip',
    message: `You received a tip of ${amount} SURGE from ${req.user.username || req.user.address}`,
    relatedId: tip.id,
  });

  successResponse(res, tip, 'Tip sent', 201);
};

module.exports = { createTip };
