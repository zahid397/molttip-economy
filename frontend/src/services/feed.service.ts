import api from './api';
import { Post } from '@/types/post.types';
import { mockFeed } from '@/mocks/feed';

interface FeedResponse {
  posts: Post[];
}

export const feedService = {
  async getFeed(): Promise<Post[]> {
    try {
      const response = await api.get<FeedResponse | Post[]>('/posts/feed');

      if (Array.isArray(response.data)) {
        return response.data;
      }

      return response.data.posts;
    } catch (err: any) {
      if (err.message === 'NETWORK_ERROR') {
        return mockFeed; // ✅ silent fallback
      }
      throw err; // real error
    }
  },
};
