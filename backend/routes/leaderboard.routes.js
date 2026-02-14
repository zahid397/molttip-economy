const express = require('express');
const router = express.Router();
const { getTopEarners } = require('../controllers/leaderboard.controller');

router.get('/top-earners', getTopEarners);

module.exports = router;
