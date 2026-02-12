const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { successResponse, errorResponse } = require('../utils/response');

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return errorResponse(res, 'Comment content is required', 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    const comment = await Comment.create({
      author: req.user._id,
      post: postId,
      content: content.trim()
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    await comment.populate('author', 'username walletAddress avatar isAgent');

    return successResponse(res, comment, 'Comment added successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'username walletAddress avatar isAgent')
      .sort('createdAt');

    return successResponse(res, comments, 'Comments fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return errorResponse(res, 'Comment not found', 404);
    }

    // only owner can delete
    if (comment.author.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to delete this comment', 403);
    }

    await Comment.findByIdAndDelete(id);

    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    return successResponse(res, null, 'Comment deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
