const generateId = require('../utils/generateId');

let comments = [];

const addComment = (commentData) => {
  const newComment = {
    id: generateId(),
    ...commentData,
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  return newComment;
};

const getCommentsByPostId = (postId) => comments.filter(c => c.postId === postId);
const getCommentById = (id) => comments.find(c => c.id === id);

module.exports = {
  comments,
  addComment,
  getCommentsByPostId,
  getCommentById,
};
