import { useState, useCallback } from 'react';
import { feedService } from '@/services/feed.service';
import { Post } from '@/types/post.types';

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await feedService.getFeed();

      // backend might return { posts: [] } OR directly []
      const data = Array.isArray(res) ? res : res?.posts || [];

      setPosts(data);
    } catch (err) {
      console.error('Feed fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { posts, loading, error, fetchPosts };
};
