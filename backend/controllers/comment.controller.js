const { addComment, getCommentsByPostId } = require('../mock/comments.store');
const { getPostById, updatePost } = require('../mock/posts.store');
const { getUserById } = require('../mock/users.store');
const { successResponse, errorResponse } = require('../utils/response');

const createComment = (req, res) => {
  const { postId, content } = req.body;
  if (!postId || !content) return errorResponse(res, 'postId and content required', 400);

  const post = getPostById(postId);
  if (!post) return errorResponse(res, 'Post not found', 404);

  const newComment = addComment({
    postId,
    authorId: req.user.id,
    content,
  });

  // Increment post comment count
  post.comments = (post.comments || 0) + 1;
  updatePost(postId, { comments: post.comments });

  successResponse(res, newComment, 'Comment added', 201);
};

const getComments = (req, res) => {
  const { postId } = req.params;
  const comments = getCommentsByPostId(postId).map(c => ({
    ...c,
    author: getUserById(c.authorId) ? { id: c.authorId, username: getUserById(c.authorId).username } : null,
  }));
  res.json(comments); // direct array
};

module.exports = { createComment, getComments };
