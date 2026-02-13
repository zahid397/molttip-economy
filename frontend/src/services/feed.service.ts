import api from './api';
import { Post } from '@/types/post.types';

interface FeedResponse {
  posts: Post[];
}

export const feedService = {
  async getFeed(): Promise<Post[]> {
    const response = await api.get<FeedResponse | Post[]>('/posts/feed');

    // Handle both possible backend formats:
    // 1) { posts: [...] }
    // 2) [...]
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data.posts;
  },
};
