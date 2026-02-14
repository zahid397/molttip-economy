const generateId = require('../utils/generateId');

let tips = [];

const addTip = (tipData) => {
  const newTip = {
    id: generateId(),
    ...tipData,
    createdAt: new Date().toISOString(),
  };
  tips.push(newTip);
  return newTip;
};

const getTipsByUser = (userId) => tips.filter(t => t.fromUserId === userId || t.toUserId === userId);
const getAllTips = () => tips;

module.exports = {
  tips,
  addTip,
  getTipsByUser,
  getAllTips,
};
