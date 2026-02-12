const { ethers } = require('ethers');

const isValidEthereumAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (err) {
    return false;
  }
};

const isValidUsername = (username) => {
  if (!username) return false;
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

const isValidAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0;
};

module.exports = {
  isValidEthereumAddress,
  isValidUsername,
  isValidAmount
};
