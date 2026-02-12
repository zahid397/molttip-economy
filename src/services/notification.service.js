const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const createNotification = async ({
  recipient,
  sender = null,
  type,
  message,
  relatedEntity = null,
}) => {
  if (!recipient || !type || !message) {
    throw new Error("Missing required notification fields");
  }

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    message,
    relatedEntity,
  });

  return notification;
};

const markAsRead = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new Error("Invalid notification ID");
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );

  return { success: true };
};

const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const safeLimit = Math.min(parseInt(limit) || 20, 50);
  const safePage = Math.max(parseInt(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const notifications = await Notification.find({ recipient: userId })
    .sort("-createdAt")
    .skip(skip)
    .limit(safeLimit)
    .populate("sender", "username walletAddress avatar")
    .lean(); // faster read

  const total = await Notification.countDocuments({ recipient: userId });

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return {
    notifications,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit),
    },
    unreadCount,
  };
};

module.exports = {
  createNotification,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
};
