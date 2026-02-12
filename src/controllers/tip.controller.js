const mongoose = require("mongoose");
const Tip = require("../models/Tip");
const User = require("../models/User");
const { createTip } = require("../services/tip.service");
const { successResponse, errorResponse } = require("../utils/response");
const { isValidAmount } = require("../utils/validators");

exports.sendTip = async (req, res) => {
  try {
    const { toUserId, amount, postId, commentId, txHash } = req.body;

    if (!toUserId || !amount || !txHash) {
      return errorResponse(res, "Missing required fields", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return errorResponse(res, "Invalid toUserId", 400);
    }

    if (!isValidAmount(amount)) {
      return errorResponse(res, "Invalid tip amount", 400);
    }

    if (postId && !mongoose.Types.ObjectId.isValid(postId)) {
      return errorResponse(res, "Invalid postId", 400);
    }

    if (commentId && !mongoose.Types.ObjectId.isValid(commentId)) {
      return errorResponse(res, "Invalid commentId", 400);
    }

    // Prevent tipping self
    if (toUserId.toString() === req.user._id.toString()) {
      return errorResponse(res, "You cannot tip yourself", 400);
    }

    // Check receiver exists
    const receiver = await User.findById(toUserId);
    if (!receiver) {
      return errorResponse(res, "Receiver not found", 404);
    }

    // Prevent duplicate txHash reuse
    const existingTip = await Tip.findOne({ txHash });
    if (existingTip) {
      return errorResponse(res, "This transaction hash was already used", 400);
    }

    const tip = await createTip(
      req.user._id,
      toUserId,
      Number(amount),
      postId || null,
      commentId || null,
      txHash
    );

    return successResponse(res, tip, "Tip processed successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
};
