const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const { successResponse, errorResponse } = require("../utils/response");
const { isValidEthereumAddress } = require("../utils/validators");
const authService = require("../services/auth.service");
const User = require("../models/User");

const buildMessage = (nonce) =>
  `Sign this message to authenticate with MoltTip Economy.\n\nNonce: ${nonce}`;

exports.getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !isValidEthereumAddress(walletAddress)) {
      return errorResponse(res, "Invalid wallet address", 400);
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const user = await authService.findOrCreateUser(normalizedAddress);

    return successResponse(
      res,
      {
        nonce: user.nonce,
        message: buildMessage(user.nonce),
      },
      "Nonce generated"
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
};

exports.verifySignature = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return errorResponse(res, "Wallet address and signature required", 400);
    }

    if (!isValidEthereumAddress(walletAddress)) {
      return errorResponse(res, "Invalid wallet address", 400);
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const message = buildMessage(user.nonce);

    const isValid = authService.verifySignature(
      message,
      signature,
      normalizedAddress
    );

    if (!isValid) {
      return errorResponse(res, "Signature verification failed", 401);
    }

    // 🔐 Replay protection – rotate nonce immediately
    user.nonce = authService.generateNonce();
    await user.save();

    // Minimal JWT payload
    const token = jwt.sign(
      {
        id: user._id,
        wallet: user.walletAddress,
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          isAgent: user.isAgent,
          role: user.role,
        },
      },
      "Authentication successful"
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
};
