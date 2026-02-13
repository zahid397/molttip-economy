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

      // Handle both possible backend formats:
      // 1) { posts: [...] }
      // 2) [...]
      if (Array.isArray(response.data)) {
        return response.data;
      }

      if ('posts' in response.data && Array.isArray(response.data.posts)) {
        return response.data.posts;
      }

      // fallback safety
      return [];
    } catch (error) {
      console.warn('⚠️ Feed API failed, using mock feed data', error);
      return mockFeed;
    }
  },
};
