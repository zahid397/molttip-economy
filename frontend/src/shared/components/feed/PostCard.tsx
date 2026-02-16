/**
 * Post Card Component
 *
 * Displays a single post with author info, content, image, like/tip buttons,
 * and an optional delete menu for post owners.
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, DollarSign, MoreVertical, Trash2 } from 'lucide-react';

import { Card } from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';

import { formatTimeAgo, formatCurrency, formatNumber } from '@/shared/utils/format';
import { cn } from '@/shared/utils/helpers';

import type { Post } from '@/shared/types';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => Promise<void> | void;
  onTip?: (postId: string) => void;
  onDelete?: (postId: string) => Promise<void> | void;
  showActions?: boolean;
  isOwner?: boolean;
}

/**
 * Post card component with like, tip, and delete functionality.
 */
export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onTip,
  onDelete,
  showActions = true,
  isOwner = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMenu(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLike = useCallback(async () => {
    if (!onLike || isLiking) return;

    setIsLiking(true);

    try {
      await onLike(post.id);
    } catch (err) {
      console.error('Failed to like post:', err);
    } finally {
      setIsLiking(false);
    }
  }, [onLike, post.id, isLiking]);

  const handleDelete = useCallback(async () => {
    if (!onDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      await onDelete(post.id);
    } catch (err) {
      console.error('Failed to delete post:', err);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  }, [onDelete, post.id, isDeleting]);

  return (
    <Card className="transition-all hover:shadow-moleskine-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Link
          href={`/profile/${post.user.address}`}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
        >
          <Avatar src={post.user.avatar} alt={post.user.username} size="md" />
          <div>
            <h3 className="font-semibold text-moleskine-black group-hover:text-primary-600 transition-colors">
              {post.user.username}
            </h3>
            <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </Link>

        {isOwner && onDelete && (
          <div className="relative" ref={menuRef}>
            <button
              id="post-options-button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1 hover:bg-moleskine-tan rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Post options"
              aria-expanded={showMenu}
              aria-haspopup="true"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white border-2 border-moleskine-black rounded-lg shadow-moleskine-lg z-10"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="post-options-button"
              >
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  role="menuitem"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-moleskine-black whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border-2 border-moleskine-black relative aspect-video max-h-96">
            <Image
              src={post.imageUrl}
              alt="Post attachment"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      {post.totalTipsAmount > 0 && (
        <div className="mb-4">
          <Badge variant="success" size="md">
            <DollarSign className="w-3 h-3 mr-1" />
            {formatCurrency(post.totalTipsAmount, 0)} MOLT earned
          </Badge>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-200">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60',
              post.isLiked
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-600 hover:bg-moleskine-tan'
            )}
            aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart className={cn('w-5 h-5', post.isLiked && 'fill-current')} />
            <span>{formatNumber(post.likesCount)}</span>
          </button>

          {/* Comments */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-600 hover:bg-moleskine-tan transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Comments"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{formatNumber(post.commentsCount)}</span>
          </button>

          {/* Tip */}
          {onTip && (
            <button
              onClick={() => onTip(post.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-primary-600 hover:bg-primary-50 transition-all ml-auto focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Tip post"
            >
              <DollarSign className="w-5 h-5" />
              <span>Tip</span>
            </button>
          )}
        </div>
      )}
    </Card>
  );
};
