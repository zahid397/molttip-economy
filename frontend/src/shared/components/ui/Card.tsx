/**
 * Card Component
 *
 * A flexible card container with support for headers, footers, images,
 * interactive states, and consistent styling.
 *
 * @example
 * <Card variant="elevated" hoverable>
 *   <Card.Image src="/image.jpg" alt="Description" />
 *   <Card.Header title="Card Title" subtitle="Subtitle" />
 *   <Card.Body>Main content goes here</Card.Body>
 *   <Card.Footer>Action buttons</Card.Footer>
 * </Card>
 */

import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/helpers';

// ============================================================================
// Main Card Component
// ============================================================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Padding around the entire card (applies to direct children) */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether the card has a hover effect (scale and shadow) */
  hoverable?: boolean;
  /** Makes the card clickable (adds role="button" and keyboard handling) */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** Disables interactive card (only applies if onClick is provided) */
  disabled?: boolean;
}

/**
 * Main card container. If onClick is provided, the card becomes interactive
 * and supports keyboard activation.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      onClick,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const isInteractive = !!onClick;

    const variants = {
      default: 'bg-white border-2 border-moleskine-black',
      outlined: 'bg-transparent border-2 border-moleskine-black',
      elevated: 'bg-white shadow-moleskine-lg border border-gray-200',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          variants[variant],
          paddings[padding],
          // Hover styles
          hoverable && !disabled && 'hover:shadow-moleskine-lg hover:-translate-y-1',
          // Interactive styles
          isInteractive &&
            !disabled &&
            'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          isInteractive && disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        onClick={!disabled ? onClick : undefined}
        onKeyDown={
          isInteractive && !disabled
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.(e as any);
                }
              }
            : undefined
        }
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive && !disabled ? 0 : undefined}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// Card Header Subcomponent
// ============================================================================

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Main title of the card */
  title?: React.ReactNode;
  /** Subtitle or description */
  subtitle?: React.ReactNode;
  /** Actions (buttons, icons) displayed on the right */
  actions?: React.ReactNode;
  /** Whether to add a dividing line below the header */
  divider?: boolean;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, actions, divider = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4',
          divider && 'border-b border-gray-200 pb-3 mb-3',
          className
        )}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-moleskine-black">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'Card.Header';

// ============================================================================
// Card Body Subcomponent
// ============================================================================

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to remove default padding (if card handles padding) */
  noPadding?: boolean;
}

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, noPadding = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(!noPadding && 'py-2', className)}
        {...props}
      />
    );
  }
);

CardBody.displayName = 'Card.Body';

// ============================================================================
// Card Footer Subcomponent
// ============================================================================

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to add a dividing line above the footer */
  divider?: boolean;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, divider = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-2',
          divider && 'border-t border-gray-200 pt-3 mt-3',
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'Card.Footer';

// ============================================================================
// Card Image Subcomponent
// ============================================================================

export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Whether the image should be full width and cover the top */
  cover?: boolean;
}

const CardImage = forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, cover = false, alt = '', ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn(
          cover && 'w-full object-cover rounded-t-lg',
          !cover && 'rounded-lg',
          className
        )}
        alt={alt}
        {...props}
      />
    );
  }
);

CardImage.displayName = 'Card.Image';

// ============================================================================
// Attach subcomponents to Card for convenient imports
// ============================================================================

export const CardNamespace = Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Image: CardImage,
});

// Default export for convenience
export default CardNamespace;
