const Post = require('../models/Post');
const { successResponse, errorResponse } = require('../utils/response');

exports.createPost = async (req, res) => {
  try {
    const { content, media, tags } = req.body;

    if (!content) {
      return errorResponse(res, 'Post content is required', 400);
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      media: media || [],
      tags: tags || []
    });

    await post.populate('author', 'username walletAddress avatar isAgent');

    return successResponse(res, post, 'Post created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'username walletAddress avatar isAgent')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments();

    return successResponse(res, {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Feed retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate(
      'author',
      'username walletAddress avatar isAgent'
    );

    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    return successResponse(res, post, 'Post retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to delete this post', 403);
    }

    await post.deleteOne();

    return successResponse(res, null, 'Post deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
