/**
 * Core Type Definitions
 * Molttip Economy - Shared Types
 */

/* ─────────────────────────────────────────────── */
/* 🔥 Utility Types */
/* ─────────────────────────────────────────────── */

export type ID = string;
export type ISODateString = string;

/* ─────────────────────────────────────────────── */
/* 👤 User Types */
/* ─────────────────────────────────────────────── */

export interface User {
  id: ID;
  address: string;
  username: string;

  bio?: string;
  avatar?: string;

  balance: number;

  totalTipsReceived: number;
  totalTipsSent: number;

  postCount: number;
  followerCount: number;
  followingCount: number;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ─────────────────────────────────────────────── */
/* 📝 Post Types */
/* ─────────────────────────────────────────────── */

export interface Post {
  id: ID;
  userId: ID;

  user: User;

  content: string;
  imageUrl?: string;

  likesCount: number;
  commentsCount: number;
  tipsCount: number;
  totalTipsAmount: number;

  isLiked: boolean;
  isTipped: boolean;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ─────────────────────────────────────────────── */
/* 💬 Comment Types */
/* ─────────────────────────────────────────────── */

export interface Comment {
  id: ID;
  postId: ID;
  userId: ID;

  user: User;

  content: string;
  likesCount: number;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ─────────────────────────────────────────────── */
/* 💸 Tip Types */
/* ─────────────────────────────────────────────── */

export interface Tip {
  id: ID;

  fromUserId: ID;
  toUserId: ID;

  postId?: ID;

  amount: number;
  message?: string;

  from: User;
  to: User;

  post?: Post;

  createdAt: ISODateString;
}

/* ─────────────────────────────────────────────── */
/* 🛒 Marketplace Types */
/* ─────────────────────────────────────────────── */

export type MarketplaceItemStatus = 'available' | 'sold' | 'reserved';

export interface MarketplaceItem {
  id: ID;
  sellerId: ID;

  seller: User;

  title: string;
  description: string;

  price: number;
  imageUrl?: string;

  category: string;
  status: MarketplaceItemStatus;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ─────────────────────────────────────────────── */
/* 🔔 Notification Types */
/* ─────────────────────────────────────────────── */

export type NotificationType = 'like' | 'comment' | 'tip' | 'follow' | 'mention';

export interface Notification {
  id: ID;
  userId: ID;

  type: NotificationType;
  message: string;

  fromUserId?: ID;
  from?: User;

  postId?: ID;

  isRead: boolean;

  createdAt: ISODateString;
}

/* ─────────────────────────────────────────────── */
/* 🏆 Leaderboard Types */
/* ─────────────────────────────────────────────── */

export interface LeaderboardEntry {
  rank: number;
  user: User;
  value: number;
  change?: number;
}

/* ─────────────────────────────────────────────── */
/* 🌐 API Response Types */
/* ─────────────────────────────────────────────── */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/* ─────────────────────────────────────────────── */
/* 🧾 Form Types */
/* ─────────────────────────────────────────────── */

export interface CreatePostData {
  content: string;
  imageUrl?: string;
}

export interface CreateCommentData {
  postId: ID;
  content: string;
}

export interface SendTipData {
  toUserId: ID;
  amount: number;
  postId?: ID;
  message?: string;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatar?: string;
}

/* ─────────────────────────────────────────────── */
/* 🔍 Filters & Sorting */
/* ─────────────────────────────────────────────── */

export type SortOrder = 'asc' | 'desc';

export type FeedSortBy = 'latest' | 'popular' | 'trending';

export interface FeedFilters {
  userId?: ID;
  sortBy?: FeedSortBy;
  page?: number;
  pageSize?: number;
}

export type LeaderboardType = 'tippers' | 'receivers' | 'posters';
export type LeaderboardPeriod = 'day' | 'week' | 'month' | 'all';

export interface LeaderboardFilters {
  type: LeaderboardType;
  period?: LeaderboardPeriod;
  limit?: number;
}

/* ─────────────────────────────────────────────── */
/* 👛 Wallet Types */
/* ─────────────────────────────────────────────── */

export interface WalletState {
  address: string | null;
  balance: number;
  isConnected: boolean;
  isLoading: boolean;
}

/* ─────────────────────────────────────────────── */
/* 🤖 Simulation Types */
/* ─────────────────────────────────────────────── */

export interface SimulationConfig {
  enabled: boolean;
  autoPostInterval: number;
  autoTipInterval: number;
  autoCommentInterval: number;
  autoLikeInterval: number;
  botCount: number;
}

export type BotPersonality = 'enthusiastic' | 'critic' | 'supporter' | 'casual';
export type BotActivityLevel = 'low' | 'medium' | 'high';

export interface BotUser extends User {
  isBot: true;
  personality: BotPersonality;
  activityLevel: BotActivityLevel;
}
