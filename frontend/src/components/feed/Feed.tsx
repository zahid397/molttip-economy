'use client';

import { useEffect, useState } from 'react';
import { PostCard } from './PostCard';
import { PostSkeleton } from './PostSkeleton';
import { EmptyFeed } from './EmptyFeed';
import { useFeed } from '@/hooks/useFeed';
import { Post } from '@/types/post.types';

interface FeedProps {
  profileAddress?: string;
}

export const Feed = ({ profileAddress }: FeedProps) => {
  const { posts, loading, error, fetchPosts } = useFeed();
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profileAddress) {
      setFilteredPosts(
        posts.filter(
          (p) =>
            p.author?.address?.toLowerCase() ===
            profileAddress?.toLowerCase()
        )
      );
    } else {
      setFilteredPosts(posts);
    }
  }, [posts, profileAddress]);

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-red-400">Failed to load feed: {error}</p>
        <button
          onClick={fetchPosts}
          className="mt-4 px-4 py-2 bg-neon-blue/20 rounded-lg hover:bg-neon-blue/30 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div className="space-y-4">
      {filteredPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
