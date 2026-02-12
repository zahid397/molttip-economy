const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const { errorResponse } = require("../utils/response");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, "Not authorized, no token provided", 401);
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Find user
    const user = await User.findById(decoded.id).select("-nonce");

    if (!user) {
      return errorResponse(res, "User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Invalid or expired token", 401);
  }
};

module.exports = { protect };
