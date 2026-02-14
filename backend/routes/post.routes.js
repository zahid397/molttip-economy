const express = require('express');
const router = express.Router();
const { getFeed, createPost, getPost } = require('../controllers/post.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/feed', getFeed);
router.post('/', authMiddleware, createPost);
router.get('/:id', getPost);

module.exports = router;
