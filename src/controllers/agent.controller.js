const mongoose = require("mongoose");
const Agent = require("../models/Agent");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/response");
const { isValidUsername } = require("../utils/validators");

exports.registerAgent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { username, description, category, website, twitter } = req.body;

    // Prevent duplicate agent profile
    const existingAgent = await Agent.findOne({ user: userId });
    if (existingAgent) {
      await session.abortTransaction();
      return errorResponse(res, "User already registered as agent", 400);
    }

    let normalizedUsername = null;

    if (username) {
      if (!isValidUsername(username)) {
        await session.abortTransaction();
        return errorResponse(res, "Invalid username format", 400);
      }

      normalizedUsername = username.toLowerCase();

      const existingUser = await User.findOne({ username: normalizedUsername });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        await session.abortTransaction();
        return errorResponse(res, "Username already taken", 400);
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        username: normalizedUsername,
        isAgent: true,
        bio: description,
      },
      { new: true, session }
    );

    // Create agent profile
    const agent = await Agent.create(
      [
        {
          user: userId,
          description,
          category,
          website,
          twitter,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return successResponse(
      res,
      { user, agent: agent[0] },
      "Agent registered successfully",
      201
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return errorResponse(res, error.message || "Server error", 500);
  }
};

exports.getAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findOne({ user: id })
      .populate("user", "username walletAddress avatar bio totalTipsReceived")
      .lean();

    if (!agent) {
      return errorResponse(res, "Agent not found", 404);
    }

    return successResponse(res, agent, "Agent retrieved");
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
};

exports.getAllAgents = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};
    if (category) {
      filter.category = category;
    }

    const agents = await Agent.find(filter)
      .populate("user", "username walletAddress avatar bio totalTipsReceived")
      .sort({ totalTips: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const total = await Agent.countDocuments(filter);

    return successResponse(res, {
      agents,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
};
