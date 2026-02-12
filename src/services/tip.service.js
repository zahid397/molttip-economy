const Tip = require("../models/Tip");
const User = require("../models/User");
const Agent = require("../models/Agent");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const notificationService = require("./notification.service");
const logger = require("../config/logger");

const verifyTransaction = async (txHash, expectedAmount, expectedToUserId) => {
  // Hackathon mode: always true
  // In production: fetch receipt from chain and verify amount + receiver
  logger.info(`Simulating tx verification: ${txHash}`);
  return true;
};

const createTip = async ({
  fromUserId,
  toUserId,
  amount,
  postId = null,
  commentId = null,
  txHash = null,
}) => {
  if (!fromUserId || !toUserId) {
    throw new Error("Sender and receiver required");
  }

  const tipAmount = Number(amount);
  if (isNaN(tipAmount) || tipAmount <= 0) {
    throw new Error("Invalid tip amount");
  }

  if (fromUserId.toString() === toUserId.toString()) {
    throw new Error("You cannot tip yourself");
  }

  const sender = await User.findById(fromUserId);
  if (!sender) throw new Error("Sender user not found");

  const receiver = await User.findById(toUserId);
  if (!receiver) throw new Error("Receiver user not found");

  // If postId provided, validate post exists
  if (postId) {
    const postExists = await Post.findById(postId);
    if (!postExists) throw new Error("Post not found");
  }

  // If commentId provided, validate comment exists
  if (commentId) {
    const commentExists = await Comment.findById(commentId);
    if (!commentExists) throw new Error("Comment not found");
  }

  // Prevent duplicate txHash
  if (txHash) {
    const existingTip = await Tip.findOne({ txHash });
    if (existingTip) {
      throw new Error("This transaction hash already used");
    }

    const isValidTx = await verifyTransaction(txHash, tipAmount, toUserId);
    if (!isValidTx) {
      throw new Error("Transaction verification failed");
    }
  }

  // Create tip record
  const tip = await Tip.create({
    from: fromUserId,
    to: toUserId,
    post: postId,
    comment: commentId,
    amount: tipAmount,
    txHash,
    status: "confirmed",
  });

  // Update receiver stats
  await User.findByIdAndUpdate(toUserId, {
    $inc: { totalTipsReceived: tipAmount },
  });

  // Update agent stats if receiver is an agent
  await Agent.findOneAndUpdate(
    { user: toUserId },
    { $inc: { totalTips: tipAmount, tipCount: 1 } }
  );

  // Update post stats
  if (postId) {
    await Post.findByIdAndUpdate(postId, {
      $inc: { tipCount: 1, totalTips: tipAmount },
    });
  }

  // Notification
  await notificationService.createNotification({
    recipient: toUserId,
    sender: fromUserId,
    type: "tip",
    message: `You received ${tipAmount} SURGE tip from ${sender.walletAddress}`,
    relatedEntity: {
      entityType: "Tip",
      entityId: tip._id,
    },
  });

  return tip;
};

module.exports = {
  createTip,
  verifyTransaction,
};
