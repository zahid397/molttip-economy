/**
 * Button Component
 *
 * A flexible, accessible button component with variants, sizes,
 * loading state, and optional icons.
 */

import React from 'react';
import { cn } from '@/shared/utils/helpers';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state (disables button + shows spinner) */
  isLoading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon before text */
  leftIcon?: React.ReactNode;
  /** Icon after text */
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // ------------------------------------------------------------------
    // Base Styles
    // ------------------------------------------------------------------
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // ------------------------------------------------------------------
    // Variants
    // ------------------------------------------------------------------
    const variants = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary:
        'bg-moleskine-tan text-moleskine-black hover:bg-moleskine-tan/80 focus:ring-moleskine-tan',
      outline:
        'border-2 border-moleskine-black text-moleskine-black hover:bg-moleskine-black hover:text-moleskine-cream focus:ring-moleskine-black',
      ghost:
        'text-moleskine-black hover:bg-moleskine-cream/50 focus:ring-moleskine-black',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    // ------------------------------------------------------------------
    // Sizes
    // ------------------------------------------------------------------
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };

    const isDisabled = disabled || isLoading;

    // ------------------------------------------------------------------
    // Spinner
    // ------------------------------------------------------------------
    const Spinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner />
            <span className="ml-2">{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
