/**
 * Feed Service
 *
 * Provides methods for interacting with feed-related API endpoints.
 * Handles posts, likes, and user feeds with pagination support.
 * All methods accept an optional AbortSignal for request cancellation.
 */

import { api } from '@/shared/utils/api';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '@/shared/constants';
import type {
  Post,
  PaginatedResponse,
  CreatePostData,
  FeedFilters,
} from '@/shared/types';

/**
 * Service object containing all feed-related API calls.
 */
export const feedService = {
  /**
   * Retrieves a paginated list of feed posts with optional filters.
   */
  getPosts: async (
    filters?: FeedFilters,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Post>> => {
    const params = new URLSearchParams();

    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    // ✅ FIX: page/pageSize falsy bug solved
    if (filters?.page !== undefined)
      params.append('page', filters.page.toString());

    if (filters?.pageSize !== undefined)
      params.append('pageSize', filters.pageSize.toString());

    const queryString = params.toString();
    const url = `${API_ENDPOINTS.POSTS}${queryString ? `?${queryString}` : ''}`;

    return api.get<PaginatedResponse<Post>>(url, { signal });
  },

  /**
   * Fetches a single post by its ID.
   */
  getPost: async (id: string, signal?: AbortSignal): Promise<Post> => {
    return api.get<Post>(API_ENDPOINTS.POST_BY_ID(id), { signal });
  },

  /**
   * Creates a new post.
   */
  createPost: async (
    data: CreatePostData,
    signal?: AbortSignal
  ): Promise<Post> => {
    return api.post<Post>(API_ENDPOINTS.POSTS, data, { signal });
  },

  /**
   * Deletes a post by its ID.
   */
  deletePost: async (id: string, signal?: AbortSignal): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.POST_BY_ID(id), { signal });
  },

  /**
   * Likes a post.
   */
  likePost: async (id: string, signal?: AbortSignal): Promise<Post> => {
    return api.post<Post>(API_ENDPOINTS.POST_LIKE(id), undefined, { signal });
  },

  /**
   * Unlikes a post.
   */
  unlikePost: async (id: string, signal?: AbortSignal): Promise<Post> => {
    return api.post<Post>(API_ENDPOINTS.POST_UNLIKE(id), undefined, { signal });
  },

  /**
   * Retrieves posts created by a specific user.
   */
  getUserPosts: async (
    userId: string,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Post>> => {
    const params = new URLSearchParams({
      userId,
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const url = `${API_ENDPOINTS.POSTS}?${params.toString()}`;

    return api.get<PaginatedResponse<Post>>(url, { signal });
  },
};
