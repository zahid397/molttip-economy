const { ethers } = require("ethers");
const crypto = require("crypto");
const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| Generate Secure Nonce
|--------------------------------------------------------------------------
| Instead of Math.random (weak), use crypto for secure randomness
*/
const generateNonce = () => {
  return crypto.randomBytes(16).toString("hex");
};

/*
|--------------------------------------------------------------------------
| Find or Create User
|--------------------------------------------------------------------------
*/
const findOrCreateUser = async (walletAddress) => {
  const address = walletAddress.toLowerCase();

  let user = await User.findOne({ walletAddress: address });

  if (!user) {
    user = await User.create({
      walletAddress: address,
      nonce: generateNonce(),
    });
  }

  return user;
};

/*
|--------------------------------------------------------------------------
| Verify Signature
|--------------------------------------------------------------------------
*/
const verifySignature = async (walletAddress, signature) => {
  const address = walletAddress.toLowerCase();

  const user = await User.findOne({ walletAddress: address });

  if (!user) {
    throw new Error("User not found");
  }

  const message = `Sign this message to authenticate with MoltTip Economy.\nNonce: ${user.nonce}`;

  let recoveredAddress;

  try {
    recoveredAddress = ethers.verifyMessage(message, signature);
  } catch (err) {
    throw new Error("Invalid signature format");
  }

  if (recoveredAddress.toLowerCase() !== address) {
    throw new Error("Signature verification failed");
  }

  // Prevent replay attack → regenerate nonce
  user.nonce = generateNonce();
  await user.save();

  return user;
};

module.exports = {
  generateNonce,
  findOrCreateUser,
  verifySignature,
};
