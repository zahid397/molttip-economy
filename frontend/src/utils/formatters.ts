export const formatAddress = (address?: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string | number): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;

  if (isNaN(num)) return '0.0000';

  return num.toFixed(4);
};

export const formatNumber = (num: number): string => {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat().format(num);
};
