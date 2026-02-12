const express = require("express");
const {
  addComment,
  getPostComments,
} = require("../controllers/comment.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/:postId", protect, addComment);
router.get("/:postId", getPostComments);

module.exports = router;
