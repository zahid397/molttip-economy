const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { getUserByAddress, createUser } = require('../mock/users.store');
const { successResponse, errorResponse } = require('../utils/response');

const getNonce = (req, res) => {
  const { address } = req.body;
  if (!address) return errorResponse(res, 'Address is required', 400);

  let user = getUserByAddress(address);
  if (!user) {
    user = createUser(address);
  }

  const message = `Sign this message to authenticate. Nonce: ${user.nonce}`;
  successResponse(res, { message });
};

const verifySignature = (req, res) => {
  const { address, signature } = req.body;
  if (!address || !signature) return errorResponse(res, 'Address and signature required', 400);

  let user = getUserByAddress(address);
  if (!user) {
    user = createUser(address);
  }

  // Demo mode: accept any signature; generate new nonce to prevent reuse
  user.nonce = Math.floor(Math.random() * 1000000).toString();

  const token = jwt.sign(
    { id: user.id, address: user.address },
    jwtSecret,
    { expiresIn: '7d' }
  );

  successResponse(res, { token, user: { id: user.id, address: user.address, username: user.username } });
};

module.exports = { getNonce, verifySignature };
