/**
 * Formatting Utilities
 * Used across UI components (dates, currency, numbers, addresses, etc.)
 */

import { format, formatDistanceToNow } from 'date-fns';

/* ─────────────────────────────────────────────── */
/* 💰 Currency Formatting */
/* ─────────────────────────────────────────────── */

export const formatCurrency = (
  amount: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  if (isNaN(amount)) return '0';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/* ─────────────────────────────────────────────── */
/* 🔢 Number Formatting */
/* ─────────────────────────────────────────────── */

export const formatNumber = (num: number): string => {
  if (isNaN(num)) return '0';

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }

  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }

  return num.toString();
};

/* ─────────────────────────────────────────────── */
/* 🪪 Wallet Address Formatting */
/* ─────────────────────────────────────────────── */

export const formatAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';

  if (address.length <= chars * 2) return address;

  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/* ─────────────────────────────────────────────── */
/* 📅 Date Formatting */
/* ─────────────────────────────────────────────── */

export const formatDate = (date: string | Date): string => {
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return '';
  }
};

export const formatDateTime = (date: string | Date): string => {
  try {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  } catch {
    return '';
  }
};

export const formatTimeAgo = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
};

/* ─────────────────────────────────────────────── */
/* ✂️ Text Formatting */
/* ─────────────────────────────────────────────── */

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
};

/* ─────────────────────────────────────────────── */
/* 🧑 Avatar Generator */
/* ─────────────────────────────────────────────── */

export const generateAvatar = (seed: string): string => {
  if (!seed) seed = 'user';

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
};

/* ─────────────────────────────────────────────── */
/* 📈 Percentage */
/* ─────────────────────────────────────────────── */

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/* ─────────────────────────────────────────────── */
/* 🔤 Pluralization */
/* ─────────────────────────────────────────────── */

export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};
