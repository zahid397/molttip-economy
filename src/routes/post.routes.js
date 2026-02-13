const express = require("express");
const router = express.Router();

// GET /api/posts/feed
router.get("/feed", async (req, res) => {
  res.status(200).json([
    {
      id: "1",
      content: "Welcome to MoltTip 🚀",
      createdAt: new Date().toISOString(),
      likes: 12,
      comments: 4,
      author: {
        address: "0x1234567890123456789012345678901234567890",
        displayName: "MoltTip Team",
        bio: "Official MoltTip account",
        avatar: "",
        joinedAt: new Date().toISOString(),
      },
    },
    {
      id: "2",
      content: "Tip creators, earn rewards 💸🔥",
      createdAt: new Date().toISOString(),
      likes: 5,
      comments: 1,
      author: {
        address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        displayName: "Zahid Hasan",
        bio: "Web3 + AI Developer",
        avatar: "",
        joinedAt: new Date().toISOString(),
      },
    },
  ]);
});

module.exports = router;
