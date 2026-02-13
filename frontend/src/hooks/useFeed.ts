import { useState, useCallback } from 'react';
import { feedService } from '@/services/feed.service';
import { Post } from '@/types/post.types';

interface FeedResponse {
  posts?: Post[];
}

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await feedService.getFeed();

      let data: Post[] = [];

      // Case 1: backend returns array directly
      if (Array.isArray(res)) {
        data = res;
      }
      // Case 2: backend returns { posts: [] }
      else if ((res as FeedResponse)?.posts) {
        data = (res as FeedResponse).posts!;
      }

      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { posts, loading, error, fetchPosts };
};
