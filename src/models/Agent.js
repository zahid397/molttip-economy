const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['content', 'assistant', 'analytics', 'other'],
      default: 'other'
    },
    website: String,
    twitter: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    totalTips: {
      type: Number,
      default: 0
    },
    tipCount: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Agent', agentSchema);
