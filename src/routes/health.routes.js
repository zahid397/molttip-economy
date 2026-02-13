const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MoltTip API is running 🚀',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

module.exports = router;
