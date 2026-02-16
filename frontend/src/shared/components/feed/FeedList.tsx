'use client';

import React, { useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';

import { PostCard } from './PostCard';
import { LoadingSpinner } from '@/shared/components/ui/Spinner';
import { EmptyState } from '@/shared/components/ui/EmptyState';

import { useToast } from '@/shared/components/ui/Toast';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { feedService } from '../services/feed.service';
import { useFeedStore } from '../store/feed.store';
import { useWallet } from '@/shared/hooks/useWallet';

import { QUERY_KEYS, DEFAULT_PAGE_SIZE } from '@/shared/constants';
import { cn } from '@/shared/utils/helpers';

interface FeedListProps {
  onTipClick?: (postId: string) => void;
}

export const FeedList: React.FC<FeedListProps> = ({ onTipClick }) => {
  const { address } = useWallet();
  const { success, error: showError } = useToast();

  const {
    posts,
    sortBy,
    setPosts,
    updatePost,
    removePost,
  } = useFeedStore();

  /* ================================
     React Query Infinite Fetch
  ================================= */

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.POSTS, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      feedService.getPosts({
        sortBy,
        page: pageParam,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });

  /* ================================
     Sync React Query → Zustand
  ================================= */

  useEffect(() => {
    if (!data) return;

    const allPosts = data.pages.flatMap((page) => page.items);
    setPosts(allPosts);
  }, [data, setPosts]);

  /* ================================
     Infinite Scroll
  ================================= */

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
    rootMargin: '200px',
  });

  /* ================================
     Like Handler
  ================================= */

  const handleLike = useCallback(
    async (postId: string) => {
      try {
        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        const updated = post.isLiked
          ? await feedService.unlikePost(postId)
          : await feedService.likePost(postId);

        updatePost(postId, updated);
      } catch (err) {
        console.error('Like error:', err);
        showError('Failed to update like. Please try again.');
      }
    },
    [posts, updatePost, showError]
  );

  /* ================================
     Delete Handler
  ================================= */

  const handleDelete = useCallback(
    async (postId: string) => {
      if (!window.confirm('Are you sure you want to delete this post?'))
        return;

      try {
        await feedService.deletePost(postId);
        removePost(postId);
        success('Post deleted successfully');
      } catch (err) {
        console.error('Delete error:', err);
        showError('Failed to delete post');
      }
    },
    [removePost, success, showError]
  );

  /* ================================
     States
  ================================= */

  if (isLoading) {
    return <LoadingSpinner message="Loading posts..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={FileText}
        title="Failed to load posts"
        description={
          (error as Error)?.message ??
          'Something went wrong. Please try again.'
        }
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  if (!posts.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No posts yet"
        description="Be the first to share something with the community!"
      />
    );
  }

  /* ================================
     Render
  ================================= */

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onTip={onTipClick}
          onDelete={handleDelete}
          isOwner={post.user.address === address}
        />
      ))}

      {/* Infinite Scroll Sentinel */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="py-4 flex justify-center"
        >
          {isFetchingNextPage && (
            <LoadingSpinner
              spinnerSize="sm"
              message="Loading more..."
            />
          )}
        </div>
      )}
    </div>
  );
};
