const express = require("express");
const {
  getMyNotifications,
  readNotification,
} = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, readNotification);

module.exports = router;
