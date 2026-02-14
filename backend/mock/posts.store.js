const generateId = require('../utils/generateId');

let posts = [];

const addPost = (postData) => {
  const newPost = {
    id: generateId(),
    ...postData,
    likes: postData.likes || 0,
    comments: postData.comments || 0,
    createdAt: new Date().toISOString(),
  };

  posts.push(newPost);
  return newPost;
};

const getPostById = (id) => posts.find((p) => p.id === id);

const getAllPosts = () => {
  return [...posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

const deletePost = (id) => {
  posts = posts.filter((p) => p.id !== id);
};

const updatePost = (id, updates) => {
  const index = posts.findIndex((p) => p.id === id);

  if (index !== -1) {
    posts[index] = { ...posts[index], ...updates };
    return posts[index];
  }

  return null;
};

module.exports = {
  posts,
  addPost,
  getPostById,
  getAllPosts,
  deletePost,
  updatePost,
};
