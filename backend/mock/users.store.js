const generateId = require('../utils/generateId');

// In‑memory store
let users = [];

// Predefined bot users
const botUsers = [
  { id: generateId(), address: '0xBot1', username: 'BotAlice', isBot: true, totalEarned: 0 },
  { id: generateId(), address: '0xBot2', username: 'BotBob', isBot: true, totalEarned: 0 },
  { id: generateId(), address: '0xBot3', username: 'BotCharlie', isBot: true, totalEarned: 0 },
];
users.push(...botUsers);

// Helper functions
const getUserByAddress = (address) => users.find(u => u.address === address);
const getUserById = (id) => users.find(u => u.id === id);
const createUser = (address) => {
  const newUser = {
    id: generateId(),
    address,
    username: null,
    nonce: Math.floor(Math.random() * 1000000).toString(),
    totalEarned: 0,
    isBot: false,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
};

const updateUserEarnings = (userId, amount) => {
  const user = getUserById(userId);
  if (user) user.totalEarned += amount;
};

const getAllUsers = () => users;

module.exports = {
  users,
  getUserByAddress,
  getUserById,
  createUser,
  updateUserEarnings,
  getAllUsers,
};
