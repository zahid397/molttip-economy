/**
 * Badge Component
 *
 * A small visual indicator for counts, labels, or status.
 * Supports multiple colors, sizes, and an optional dot style.
 */

import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils/helpers';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show as a simple dot (ignores children) */
  dot?: boolean;
  /** Whether the badge is outlined (no background) */
  outline?: boolean;
}

/**
 * Badge component for labels, counts, and status indicators.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      dot = false,
      outline = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: outline
        ? 'text-gray-800 border-gray-300 bg-transparent'
        : 'bg-gray-100 text-gray-800 border-gray-300',
      primary: outline
        ? 'text-primary-800 border-primary-300 bg-transparent'
        : 'bg-primary-100 text-primary-800 border-primary-300',
      success: outline
        ? 'text-green-800 border-green-300 bg-transparent'
        : 'bg-green-100 text-green-800 border-green-300',
      warning: outline
        ? 'text-yellow-800 border-yellow-300 bg-transparent'
        : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      danger: outline
        ? 'text-red-800 border-red-300 bg-transparent'
        : 'bg-red-100 text-red-800 border-red-300',
      info: outline
        ? 'text-blue-800 border-blue-300 bg-transparent'
        : 'bg-blue-100 text-blue-800 border-blue-300',
    };

    const sizes = {
      sm: dot ? 'h-2 w-2' : 'px-2 py-0.5 text-xs',
      md: dot ? 'h-2.5 w-2.5' : 'px-2.5 py-1 text-sm',
      lg: dot ? 'h-3 w-3' : 'px-3 py-1.5 text-base',
    };

    // For dot style, we don't render children, just a colored circle
    if (dot) {
      return (
        <span
          ref={ref}
          className={cn(
            'inline-block rounded-full border',
            variants[variant].split(' ')[0], // Take only the background/text class
            sizes[size],
            className
          )}
          aria-hidden="true"
          {...props}
        />
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full border',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
