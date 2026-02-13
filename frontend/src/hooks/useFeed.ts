import { useState, useCallback } from 'react';
import { feedService } from '@/services/feed.service';
import { Post } from '@/types/post.types';

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await feedService.getFeed();
      setPosts(data);
      // Optional: detect if mock data is returned by checking some field
      if (data.length > 0 && data[0].id.startsWith('mock-')) {
        setUsingMock(true);
      } else {
        setUsingMock(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { posts, loading, error, usingMock, fetchPosts };
};
