/**
 * Home Page (Feed)
 */

'use client';

import React, { useState } from 'react';
import { Container } from '@/shared/components/layout/Container';
import { CreatePost } from '@/features/feed/components/CreatePost';
import { FeedList } from '@/features/feed/components/FeedList';
import { TipModal } from '@/features/tip/components/TipModal';
import { TrendingUp, Clock, Flame } from 'lucide-react';
import { useFeedStore } from '@/features/feed/store/feed.store';
import { cn } from '@/shared/utils/helpers';

export default function HomePage() {
  const { sortBy, setSortBy } = useFeedStore();

  const [tipModalData, setTipModalData] = useState<{
    isOpen: boolean;
    postId?: string;
    recipientId?: string;
    recipientName?: string;
  }>({ isOpen: false });

  const sortOptions = [
    { value: 'latest' as const, label: 'Latest', icon: Clock },
    { value: 'popular' as const, label: 'Popular', icon: TrendingUp },
    { value: 'trending' as const, label: 'Trending', icon: Flame },
  ];

  const handleTipClick = (postId: string) => {
    // TODO: Fetch actual post/user info from API
    setTipModalData({
      isOpen: true,
      postId,
      recipientId: 'user-id',
      recipientName: 'User',
    });
  };

  const handleCloseTipModal = () => {
    setTipModalData({ isOpen: false });
  };

  return (
    <Container className="py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-moleskine-black mb-2">
            Community Feed
          </h1>
          <p className="text-gray-600">
            Share your thoughts and support quality content through tips
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = sortBy === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-moleskine-black text-moleskine-cream'
                    : 'bg-white border-2 border-moleskine-black hover:bg-moleskine-tan'
                )}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Create Post */}
        <CreatePost />

        {/* Feed */}
        <FeedList onTipClick={handleTipClick} />

        {/* Tip Modal */}
        {tipModalData.isOpen && tipModalData.recipientId && tipModalData.recipientName && (
          <TipModal
            isOpen={tipModalData.isOpen}
            onClose={handleCloseTipModal}
            recipientId={tipModalData.recipientId}
            recipientName={tipModalData.recipientName}
            postId={tipModalData.postId}
            onSuccess={() => {
              // TODO: Refetch feed or update store state
            }}
          />
        )}
      </div>
    </Container>
  );
}
