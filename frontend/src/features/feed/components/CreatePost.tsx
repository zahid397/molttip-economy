/**
 * Create Post Component
 *
 * Form for creating a new post. Visible only when wallet is connected.
 */

'use client';

import React, { useState, useCallback, useRef, FormEvent } from 'react';
import { Image as ImageIcon, Smile, Send } from 'lucide-react';

import { Card } from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Button } from '@/shared/components/ui/Button';

import { useWallet } from '@/shared/hooks/useWallet';
import { useToast } from '@/shared/components/ui/Toast';

import { MAX_POST_LENGTH } from '@/shared/constants';
import { feedService } from '../services/feed.service';
import { useFeedStore } from '../store/feed.store';
import { cn } from '@/shared/utils/helpers';

export const CreatePost: React.FC = () => {
  const { isConnected, address } = useWallet();
  const { success, error: showError } = useToast();

  const addPost = useFeedStore((state) => state.addPost);

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmedContent = content.trim();
  const isContentValid =
    trimmedContent.length > 0 &&
    trimmedContent.length <= MAX_POST_LENGTH;

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();

      if (!isContentValid || !isConnected || isSubmitting) return;

      setIsSubmitting(true);

      try {
        const newPost = await feedService.createPost({
          content: trimmedContent,
        });

        addPost(newPost);
        setContent('');
        success('Post created successfully!');

        textareaRef.current?.focus();
      } catch (err) {
        console.error('Create post error:', err);
        showError('Failed to create post. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      trimmedContent,
      isContentValid,
      isConnected,
      isSubmitting,
      addPost,
      success,
      showError,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  if (!isConnected) {
    return (
      <Card className="text-center py-8">
        <p className="text-gray-600 mb-4">
          Connect your wallet to start posting
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar
          alt={address || 'User'}
          size="md"
          fallback={address?.slice(0, 2).toUpperCase()}
        />

        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_POST_LENGTH}
            showCount
            rows={3}
            className="mb-3"
            disabled={isSubmitting}
            aria-label="Post content"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                disabled
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-gray-400 cursor-not-allowed'
                )}
                title="Add image (coming soon)"
                aria-label="Add image (coming soon)"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                disabled
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-gray-400 cursor-not-allowed'
                )}
                title="Add emoji (coming soon)"
                aria-label="Add emoji (coming soon)"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>

            <Button
              type="submit"
              disabled={!isContentValid || isSubmitting}
              isLoading={isSubmitting}
              variant="primary"
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
