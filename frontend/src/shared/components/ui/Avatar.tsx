/**
 * Avatar Component
 *
 * Displays user profile images with fallback initials.
 * Supports different sizes, interactive states, and Next.js Image optimization.
 */

import React, { forwardRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/utils/helpers';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string | null;
  /** Alt text for the image (used for fallback initials if fallback not provided) */
  alt?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom fallback text (defaults to first letter of alt) */
  fallback?: string;
  /** Whether the avatar is interactive (adds focus ring and hover effect) */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** Whether to mark the image as high priority (for LCP optimization) */
  priority?: boolean;
  /** Badge indicator (e.g., online status) – can be any React node */
  badge?: React.ReactNode;
}

/**
 * Avatar component with image fallback and badge support.
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = 'Avatar',
      size = 'md',
      fallback,
      onClick,
      priority = false,
      badge,
      className,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const isInteractive = !!onClick;
    const hasImage = src && !imageError;

    // Size classes
    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };

    // Generate fallback text
    const fallbackText = fallback || alt.charAt(0).toUpperCase();

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-full border-2 border-moleskine-black bg-moleskine-tan overflow-hidden',
          sizeClasses[size],
          // Interactive styles
          isInteractive && 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          className
        )}
        onClick={onClick}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.(e as any);
                }
              }
            : undefined
        }
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        {...props}
      >
        {hasImage ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={
              size === 'xs' ? '24px' :
              size === 'sm' ? '32px' :
              size === 'md' ? '40px' :
              size === 'lg' ? '48px' : '64px'
            }
            className="object-cover"
            onError={() => setImageError(true)}
            priority={priority}
          />
        ) : (
          <span className="font-semibold text-moleskine-black select-none">
            {fallbackText}
          </span>
        )}

        {badge && (
          <div className="absolute -bottom-0.5 -right-0.5">
            {badge}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
