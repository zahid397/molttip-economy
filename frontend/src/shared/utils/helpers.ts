/**
 * General Helper Functions
 *
 * A collection of reusable utility functions for common tasks like
 * debouncing, throttling, randomization, storage, formatting, and more.
 * All browser-dependent functions are guarded against server-side rendering (SSR).
 */

import { clsx, type ClassValue } from 'clsx';

// ============================================================================
// Environment Detection
// ============================================================================

/** Whether the code is running in a browser environment */
export const isBrowser = typeof window !== 'undefined';

/** Whether the code is running on the server */
export const isServer = !isBrowser;

// ============================================================================
// Class Name Utilities
// ============================================================================

/**
 * Merge class names with clsx.
 */
export const cn = (...inputs: ClassValue[]): string => {
  return clsx(inputs);
};

// ============================================================================
// Function Utilities
// ============================================================================

/**
 * Debounce utility
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeoutId !== null) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn.apply(this, args);
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Throttle utility
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Sleep utility
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ============================================================================
// Randomization Utilities
// ============================================================================

export const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

// ============================================================================
// Browser Interaction Utilities
// ============================================================================

export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!isBrowser) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const generateId = (): string => {
  if (isBrowser && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const isMobile = (): boolean => {
  if (!isBrowser) return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const scrollToTop = (smooth: boolean = true): void => {
  if (!isBrowser) return;

  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  });
};

// ============================================================================
// Local Storage Helpers
// ============================================================================

export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (!isBrowser) return defaultValue ?? null;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch {
      return defaultValue ?? null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (!isBrowser) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    if (!isBrowser) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },

  clear: (): void => {
    if (!isBrowser) return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

// ============================================================================
// String Utilities
// ============================================================================

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (
  str: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};

export const titleCase = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const pluralize = (count: number, singular: string, plural?: string): string => {
  return count === 1 ? singular : plural ?? `${singular}s`;
};

// ============================================================================
// Object / Array Utilities
// ============================================================================

export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;

  if (typeof value === 'object') {
    return Object.keys(value as object).length === 0;
  }

  return false;
};

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;

  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });

  return result;
};

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };

  keys.forEach((key) => {
    delete result[key];
  });

  return result;
};

// ============================================================================
// URL & Query String Utilities
// ============================================================================

export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(
    queryString.startsWith('?') ? queryString.slice(1) : queryString
  );

  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

export const buildQueryString = (
  params: Record<string, string | number | boolean>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const string = searchParams.toString();
  return string ? `?${string}` : '';
};

// ============================================================================
// Date & Time Utilities
// ============================================================================

export const formatDate = (
  date: Date | number | string,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = 'en-US'
): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat(locale, options).format(d);
};

export const formatRelativeTime = (
  date: Date | number | string,
  locale: string = 'en'
): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return rtf.format(-diffInMinutes, 'minute');

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return rtf.format(-diffInHours, 'hour');

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return rtf.format(-diffInDays, 'day');

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return rtf.format(-diffInMonths, 'month');

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
};

// ============================================================================
// Number Utilities
// ============================================================================

export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) +
    ' ' +
    sizes[i]
  );
};
