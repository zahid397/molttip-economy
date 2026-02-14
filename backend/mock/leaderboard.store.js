const { getAllUsers } = require('./users.store');

const getTopEarners = (limit = 10) => {
  const users = getAllUsers();
  return users
    .filter(u => !u.isBot) // optionally exclude bots? We'll include everyone for demo
    .sort((a, b) => (b.totalEarned || 0) - (a.totalEarned || 0))
    .slice(0, limit)
    .map(({ id, address, username, totalEarned }) => ({ id, address, username, totalEarned }));
};

module.exports = { getTopEarners };
