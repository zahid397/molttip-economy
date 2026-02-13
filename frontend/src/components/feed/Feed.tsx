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
  const { posts, loading, error, usingMock, fetchPosts } = useFeed();
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (profileAddress) {
      setFilteredPosts(
        posts.filter(
          (p) =>
            p.author.address.toLowerCase() === profileAddress.toLowerCase()
        )
      );
    } else {
      setFilteredPosts(posts);
    }
  }, [posts, profileAddress]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error && !usingMock) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-red-400">Failed to load feed: {error}</p>
        <button
          onClick={() => fetchPosts()}
          className="mt-4 px-4 py-2 bg-neon-blue/20 rounded-lg hover:bg-neon-blue/30"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Demo Mode Badge */}
      {usingMock && (
        <div className="mb-2 p-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm flex items-center gap-2">
          <span>⚡ Demo Mode: Showing sample data (backend unreachable)</span>
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <EmptyFeed />
      ) : (
        filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};
