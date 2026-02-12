const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },

    media: [
      {
        type: String
      }
    ],

    tags: [
      {
        type: String,
        trim: true
      }
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    likeCount: {
      type: Number,
      default: 0
    },

    tipCount: {
      type: Number,
      default: 0
    },

    totalTips: {
      type: Number,
      default: 0
    },

    commentCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Post', postSchema);
