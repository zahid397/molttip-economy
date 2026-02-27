import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// -------------------------------------
// ClassName Merge Utility
// -------------------------------------
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

// -------------------------------------
// Currency Formatter
// -------------------------------------
export function formatCurrency(
  amount: number,
  currency = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// -------------------------------------
// Token Formatter (no currency symbol)
// -------------------------------------
export function formatToken(
  amount: number,
  symbol = 'MOTIP'
): string {
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} ${symbol}`;
}

// -------------------------------------
// Date Formatter (safe)
// -------------------------------------
export function formatDate(
  value: number | string | Date
): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// -------------------------------------
// Short Address (Web3 style)
// -------------------------------------
export function shortenAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
