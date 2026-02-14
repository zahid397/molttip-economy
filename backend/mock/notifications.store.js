const generateId = require('../utils/generateId');

let notifications = [];

const addNotification = (notifData) => {
  const newNotif = {
    id: generateId(),
    ...notifData,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(newNotif);
  return newNotif;
};

const getNotificationsForUser = (userId) => notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const markAsRead = (notifId, userId) => {
  const notif = notifications.find(n => n.id === notifId && n.userId === userId);
  if (notif) notif.read = true;
  return notif;
};

module.exports = {
  notifications,
  addNotification,
  getNotificationsForUser,
  markAsRead,
};
