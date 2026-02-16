/**
 * EmptyState Component
 *
 * Displays a friendly message when there is no data to show.
 * Supports icon, title, description, and optional action button.
 *
 * @example
 * <EmptyState
 *   icon={<Inbox className="w-10 h-10" />}
 *   title="No posts yet"
 *   description="Be the first to create a post."
 *   action={{
 *     label: "Create Post",
 *     onClick: () => console.log("Clicked"),
 *   }}
 * />
 */

import React from 'react';
import { cn } from '@/shared/utils/helpers';
import { Button } from './Button';

export interface EmptyStateProps {
  /** Optional icon displayed at the top */
  icon?: React.ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Center vertically (useful for full-page empty states) */
  fullPage?: boolean;
  /** Additional class names */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  fullPage = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center gap-4 px-6 py-12',
        fullPage && 'min-h-[60vh]',
        className
      )}
    >
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-moleskine-tan border-2 border-moleskine-black">
          {icon}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-moleskine-black">
          {title}
        </h3>

        {description && (
          <p className="text-gray-600 max-w-md">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
