const express = require('express');
const router = express.Router();
const { createComment, getComments } = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createComment);
router.get('/:postId', getComments);

module.exports = router;
