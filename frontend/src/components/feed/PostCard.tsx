'use client';

import { useState } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { TipModal } from '@/components/modals/TipModal';
import { Post } from '@/types/post.types';
import { formatDistanceToNow } from 'date-fns';
import { formatAddress } from '@/utils/formatters';
import { HeartIcon, ChatBubbleLeftIcon, BanknotesIcon } from '@heroicons/react/24/outline';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  return (
    <>
      <article className="glass-panel p-5 hover-lift transition-all border border-glass-light/50 hover:border-neon-blue/30">
        <div className="flex gap-4">
          <Avatar address={post.author.address} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">
                {post.author.displayName || formatAddress(post.author.address)}
              </span>
              <span className="text-sm text-gray-500">·</span>
              <span className="text-sm text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="mt-2 text-gray-200 whitespace-pre-wrap">{post.content}</p>
            <div className="mt-4 flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-400 hover:text-neon-blue transition-colors">
                <HeartIcon className="w-5 h-5" />
                <span className="text-sm">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-neon-blue transition-colors">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span className="text-sm">{post.comments}</span>
              </button>
              <button
                onClick={() => setIsTipModalOpen(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-neon-purple transition-colors"
              >
                <BanknotesIcon className="w-5 h-5" />
                <span className="text-sm">Tip</span>
              </button>
            </div>
          </div>
        </div>
      </article>
      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        recipientAddress={post.author.address}
        recipientName={post.author.displayName || formatAddress(post.author.address)}
        postId={post.id}
      />
    </>
  );
};
