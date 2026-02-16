/**
 * Shared Hooks
 *
 * Central export point for all custom hooks used throughout the application.
 * This allows importing hooks and related types from a single place.
 *
 * Example:
 * import { useWallet, useDebounce } from '@/shared/hooks';
 */

// ─────────────────────────────────────────────────────────────
// Wallet Hook
// ─────────────────────────────────────────────────────────────
export { useWallet } from './useWallet';
export type {
  UseWalletReturn,
  WalletState,
  WalletActions,
  SupportedChainId,
} from './useWallet';

// ─────────────────────────────────────────────────────────────
// Local Storage Hook
// ─────────────────────────────────────────────────────────────
export { useLocalStorage } from './useLocalStorage';

// ─────────────────────────────────────────────────────────────
// Debounce Hook
// ─────────────────────────────────────────────────────────────
export { useDebounce } from './useDebounce';
export type { DebounceOptions } from './useDebounce';

// ─────────────────────────────────────────────────────────────
// Infinite Scroll Hook
// ─────────────────────────────────────────────────────────────
export { useInfiniteScroll } from './useInfiniteScroll';
export type { UseInfiniteScrollOptions } from './useInfiniteScroll';
