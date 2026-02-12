const express = require('express');
const {
  createPost,
  getFeed,
  getPostById,
  deletePost
} = require('../controllers/post.controller');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createPost);
router.get('/feed', getFeed);
router.get('/:id', getPostById);
router.delete('/:id', protect, deletePost);

module.exports = router;
