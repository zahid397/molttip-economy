const { getNotificationsForUser, markAsRead } = require('../mock/notifications.store');
const { successResponse, errorResponse } = require('../utils/response');

const getNotifications = (req, res) => {
  const notifs = getNotificationsForUser(req.user.id);
  res.json(notifs); // direct array
};

const markNotificationAsRead = (req, res) => {
  const { id } = req.params;
  const updated = markAsRead(id, req.user.id);
  if (!updated) return errorResponse(res, 'Notification not found', 404);
  successResponse(res, { read: true });
};

module.exports = { getNotifications, markNotificationAsRead };
