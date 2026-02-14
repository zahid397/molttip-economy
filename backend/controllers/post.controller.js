const { addPost, getPostById, getAllPosts, updatePost, deletePost } = require('../mock/posts.store');
const { getUserById } = require('../mock/users.store');
const { successResponse, errorResponse } = require('../utils/response');

const getFeed = (req, res) => {
  const posts = getAllPosts();
  // Optionally populate author info
  const enriched = posts.map(p => ({
    ...p,
    author: getUserById(p.authorId) ? { id: p.authorId, username: getUserById(p.authorId).username } : null,
  }));
  res.json(enriched); // direct array as requested
};

const createPost = (req, res) => {
  const { content } = req.body;
  if (!content) return errorResponse(res, 'Content is required', 400);

  const newPost = addPost({
    authorId: req.user.id,
    content,
    likes: 0,
    comments: 0,
  });
  successResponse(res, newPost, 'Post created', 201);
};

const getPost = (req, res) => {
  const post = getPostById(req.params.id);
  if (!post) return errorResponse(res, 'Post not found', 404);
  successResponse(res, post);
};

module.exports = { getFeed, createPost, getPost };
