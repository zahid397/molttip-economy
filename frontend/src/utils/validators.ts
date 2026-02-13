export const isValidEthereumAddress = (address?: string): boolean => {
  if (!address) return false;

  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidTipAmount = (amount: number): boolean => {
  if (isNaN(amount)) return false;

  return amount > 0 && amount <= 1_000_000;
};
