const { getTopEarners } = require('../mock/leaderboard.store');
const { successResponse } = require('../utils/response');

const getTopEarnersHandler = (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const top = getTopEarners(limit);
  successResponse(res, top);
};

module.exports = { getTopEarners: getTopEarnersHandler };
