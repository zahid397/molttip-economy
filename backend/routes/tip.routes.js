const express = require('express');
const router = express.Router();
const { createTip } = require('../controllers/tip.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createTip);

module.exports = router;
