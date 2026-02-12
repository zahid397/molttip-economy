const express = require("express");
const { createPost, getFeed } = require("../controllers/post.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createPost);
router.get("/feed", getFeed);

module.exports = router;
