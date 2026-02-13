import api from './api';
import { Post } from '@/types/post.types';
import { mockFeed } from '@/mocks/feed';

export const feedService = {
  async getFeed(): Promise<Post[]> {
    try {
      const { data } = await api.get('/posts/feed');
      return data;
    } catch (error) {
      console.warn('Feed API failed, using mock', error);
      await new Promise((res) => setTimeout(res, 500));
      return mockFeed;
    }
  },
};
