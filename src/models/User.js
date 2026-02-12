const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    nonce: {
      type: String,
      required: true,
      default: () => Math.floor(Math.random() * 1000000).toString()
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },

    bio: {
      type: String,
      maxlength: 500,
      default: ""
    },

    avatar: {
      type: String,
      default: ""
    },

    isAgent: {
      type: Boolean,
      default: false
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    totalTipsReceived: {
      type: Number,
      default: 0,
      min: 0
    },

    totalTipsGiven: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
