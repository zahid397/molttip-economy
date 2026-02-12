const express = require("express");
const { successResponse } = require("../utils/response");

const router = express.Router();

router.get("/", (req, res) =>
  successResponse(res, { uptime: process.uptime() }, "API is running")
);

module.exports = router;
