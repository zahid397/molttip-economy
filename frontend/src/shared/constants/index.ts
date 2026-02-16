/**
 * Application Constants
 * Molttip Economy - Shared Constants
 */

import type { LeaderboardPeriod, LeaderboardType, FeedSortBy } from '@/shared/types';

/* ─────────────────────────────────────────────── */
/* 📌 App Info */
/* ─────────────────────────────────────────────── */

export const APP_NAME = 'Molttip Economy';
export const APP_DESCRIPTION =
  'A Moleskine-style social platform with tipping economy';

/* ─────────────────────────────────────────────── */
/* 🌐 API Endpoints */
/* ─────────────────────────────────────────────── */

export const API_ENDPOINTS = {
  /* Auth */
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',

  /* Users */
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_BY_ADDRESS: (address: string) => `/api/users/address/${address}`,

  /* Posts */
  POSTS: '/api/posts',
  POST_BY_ID: (id: string) => `/api/posts/${id}`,
  POST_LIKE: (id: string) => `/api/posts/${id}/like`,
  POST_UNLIKE: (id: string) => `/api/posts/${id}/unlike`,

  /* Comments */
  POST_COMMENTS: (postId: string) => `/api/posts/${postId}/comments`,
  COMMENT_BY_ID: (id: string) => `/api/comments/${id}`,

  /* Tips */
  TIPS: '/api/tips',
  TIP_BY_ID: (id: string) => `/api/tips/${id}`,
  USER_TIPS_RECEIVED: (userId: string) => `/api/users/${userId}/tips/received`,
  USER_TIPS_SENT: (userId: string) => `/api/users/${userId}/tips/sent`,

  /* Leaderboard */
  LEADERBOARD_TIPPERS: '/api/leaderboard/tippers',
  LEADERBOARD_RECEIVERS: '/api/leaderboard/receivers',
  LEADERBOARD_POSTERS: '/api/leaderboard/posters',

  /* Marketplace */
  MARKETPLACE: '/api/marketplace',
  MARKETPLACE_ITEM: (id: string) => `/api/marketplace/${id}`,

  /* Notifications */
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATIONS_MARK_READ: '/api/notifications/mark-read',
} as const;

/* ─────────────────────────────────────────────── */
/* 💾 Local Storage Keys */
/* ─────────────────────────────────────────────── */

export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'molttip_wallet_address',
  USER_TOKEN: 'molttip_user_token',
  USER_DATA: 'molttip_user_data',
  THEME: 'molttip_theme',
  SIMULATION_CONFIG: 'molttip_simulation_config',
} as const;

/* ─────────────────────────────────────────────── */
/* 📄 Pagination */
/* ─────────────────────────────────────────────── */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/* ─────────────────────────────────────────────── */
/* 🚫 Validation Limits */
/* ─────────────────────────────────────────────── */

export const MAX_POST_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 300;
export const MAX_BIO_LENGTH = 160;
export const MAX_USERNAME_LENGTH = 30;

export const MIN_TIP_AMOUNT = 1;
export const MAX_TIP_AMOUNT = 10000;

/* ─────────────────────────────────────────────── */
/* 🤖 Simulation Defaults */
/* ─────────────────────────────────────────────── */

export const SIMULATION_DEFAULTS = {
  AUTO_POST_INTERVAL: 30000, // 30 sec
  AUTO_TIP_INTERVAL: 45000, // 45 sec
  AUTO_COMMENT_INTERVAL: 60000, // 60 sec
  AUTO_LIKE_INTERVAL: 15000, // 15 sec
  BOT_COUNT: 10,
} as const;

/* ─────────────────────────────────────────────── */
/* 🤖 Bot Settings */
/* ─────────────────────────────────────────────── */

export const BOT_PERSONALITIES = [
  'enthusiastic',
  'critic',
  'supporter',
  'casual',
] as const;

export const ACTIVITY_LEVELS = ['low', 'medium', 'high'] as const;

/* ─────────────────────────────────────────────── */
/* 🛒 Marketplace */
/* ─────────────────────────────────────────────── */

export const MARKETPLACE_CATEGORIES = [
  'art',
  'collectibles',
  'digital',
  'physical',
  'services',
  'other',
] as const;

/* ─────────────────────────────────────────────── */
/* ⏳ Time Periods */
/* ─────────────────────────────────────────────── */

export const TIME_PERIODS: Record<string, LeaderboardPeriod> = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  ALL: 'all',
} as const;

/* ─────────────────────────────────────────────── */
/* 🎨 UI Constants */
/* ─────────────────────────────────────────────── */

export const NAVBAR_HEIGHT = 64;
export const SIDEBAR_WIDTH = 280;
export const MOBILE_BREAKPOINT = 768;

/* ─────────────────────────────────────────────── */
/* 🎞️ Animations */
/* ─────────────────────────────────────────────── */

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/* ─────────────────────────────────────────────── */
/* 🔥 Toast Messages */
/* ─────────────────────────────────────────────── */

export const TOAST_MESSAGES = {
  /* Success */
  POST_CREATED: 'Post created successfully!',
  COMMENT_ADDED: 'Comment added!',
  TIP_SENT: 'Tip sent successfully!',
  PROFILE_UPDATED: 'Profile updated!',

  /* Errors */
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please connect your wallet to continue.',
  INSUFFICIENT_BALANCE: 'Insufficient balance.',

  /* Info */
  WALLET_CONNECTED: 'Wallet connected!',
  WALLET_DISCONNECTED: 'Wallet disconnected.',
} as const;

/* ─────────────────────────────────────────────── */
/* 🔑 React Query Keys */
/* ─────────────────────────────────────────────── */

export const QUERY_KEYS = {
  POSTS: 'posts',
  POST: 'post',
  COMMENTS: 'comments',
  LEADERBOARD: 'leaderboard',
  USER: 'user',
  TIPS: 'tips',
  MARKETPLACE: 'marketplace',
  NOTIFICATIONS: 'notifications',
} as const;

/* ─────────────────────────────────────────────── */
/* 📌 Extra Common Values */
/* ─────────────────────────────────────────────── */

export const FEED_SORT_OPTIONS: FeedSortBy[] = ['latest', 'popular', 'trending'];

export const LEADERBOARD_TYPES: LeaderboardType[] = [
  'tippers',
  'receivers',
  'posters',
];
