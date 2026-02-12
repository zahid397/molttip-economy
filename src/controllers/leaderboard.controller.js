const Tip = require("../models/Tip");
const Agent = require("../models/Agent");
const { successResponse, errorResponse } = require("../utils/response");

exports.getTopEarners = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const agents = await Agent.find()
      .populate("user", "username walletAddress avatar totalTipsReceived")
      .sort({ totalTips: -1 })
      .limit(parseInt(limit))
      .lean();

    return successResponse(res, agents, "Top earners retrieved");
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
};

exports.getTopTippers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topTippers = await Tip.aggregate([
      {
        $group: {
          _id: "$from",
          totalTipped: { $sum: "$amount" },
          tipCount: { $sum: 1 },
        },
      },
      { $sort: { totalTipped: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          walletAddress: "$user.walletAddress",
          username: "$user.username",
          avatar: "$user.avatar",
          totalTipped: 1,
          tipCount: 1,
        },
      },
    ]);

    return successResponse(res, topTippers, "Top tippers retrieved");
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
};
