const express = require("express");
const {
  getTopEarners,
  getTopTippers,
} = require("../controllers/leaderboard.controller");

const router = express.Router();

router.get("/top-earners", getTopEarners);
router.get("/top-tippers", getTopTippers);

module.exports = router;
