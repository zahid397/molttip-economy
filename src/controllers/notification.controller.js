const mongoose = require("mongoose");
const {
  getUserNotifications,
  markAsRead,
} = require("../services/notification.service");
const { successResponse, errorResponse } = require("../utils/response");

exports.getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const data = await getUserNotifications(req.user._id, limitNumber, skip);

    return successResponse(res, {
      notifications: data.notifications,
      unreadCount: data.unreadCount,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
};

exports.readNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Invalid notification ID", 400);
    }

    const updated = await markAsRead(id, req.user._id);

    if (!updated) {
      return errorResponse(res, "Notification not found", 404);
    }

    return successResponse(res, updated, "Notification marked as read");
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
};
