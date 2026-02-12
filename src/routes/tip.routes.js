const express = require("express");
const { sendTip } = require("../controllers/tip.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, sendTip);

module.exports = router;
