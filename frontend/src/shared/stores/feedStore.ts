/**
 * Feed Store (Zustand)
 *
 * Manages feed state including posts, pagination, and sorting.
 * Uses Immer for immutable updates and DevTools for debugging.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Post } from '@/shared/types';

// ============================================================================
// Types
// ============================================================================

export type SortOption = 'latest' | 'popular' | 'trending';

interface FeedState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  sortBy: SortOption;
}

interface FeedActions {
  setPosts: (posts: Post[]) => void;
  addPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  setSortBy: (sortBy: SortOption) => void;
  reset: () => void;
}

type FeedStore = FeedState & FeedActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: FeedState = {
  posts: [],
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,
  sortBy: 'latest',
};

// ============================================================================
// Store
// ============================================================================

export const useFeedStore = create<FeedStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setPosts: (posts) =>
        set((state) => {
          state.posts = posts;
        }),

      addPosts: (newPosts) =>
        set((state) => {
          // ✅ Prevent duplicate posts
          const existingIds = new Set(state.posts.map((p) => p.id));
          const filtered = newPosts.filter((p) => !existingIds.has(p.id));
          state.posts.push(...filtered);
        }),

      addPost: (post) =>
        set((state) => {
          // Prevent duplicate on create
          if (!state.posts.find((p) => p.id === post.id)) {
            state.posts.unshift(post);
          }
        }),

      updatePost: (postId, updates) =>
        set((state) => {
          const post = state.posts.find((p) => p.id === postId);
          if (post) {
            Object.assign(post, updates);
          }
        }),

      removePost: (postId) =>
        set((state) => {
          state.posts = state.posts.filter((p) => p.id !== postId);
        }),

      setLoading: (isLoading) =>
        set((state) => {
          state.isLoading = isLoading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      setHasMore: (hasMore) =>
        set((state) => {
          state.hasMore = hasMore;
        }),

      setPage: (page) =>
        set((state) => {
          state.page = page;
        }),

      setSortBy: (sortBy) =>
        set((state) => {
          state.sortBy = sortBy;
          state.page = 1;        // ✅ Reset page
          state.posts = [];      // ✅ Clear posts on sort change
          state.hasMore = true;  // Reset pagination
        }),

      reset: () =>
        set(() => ({
          ...initialState, // ✅ fresh copy
        })),
    })),
    { name: 'feed-store' }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const usePostById = (postId: string) =>
  useFeedStore((state) => state.posts.find((p) => p.id === postId));

export const usePostsCount = () =>
  useFeedStore((state) => state.posts.length);

export const useIsFeedEmpty = () =>
  useFeedStore((state) => !state.isLoading && state.posts.length === 0);

export const useHasMorePosts = () =>
  useFeedStore((state) => state.hasMore);
