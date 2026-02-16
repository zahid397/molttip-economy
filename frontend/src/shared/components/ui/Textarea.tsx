/**
 * Textarea Component
 *
 * A multi-line text input field with label, character count, error messaging,
 * and helper text. Built with accessibility in mind.
 */

import React, { useId } from 'react';
import { cn } from '@/shared/utils/helpers';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text displayed above the textarea */
  label?: string;
  /** Error message (also marks textarea as invalid) */
  error?: string;
  /** Helper text displayed below the textarea (when no error) */
  helperText?: string;
  /** Whether to show a character count (requires maxLength) */
  showCount?: boolean;
  /** Whether the textarea should take full width of its container */
  fullWidth?: boolean;
  /** Optional class name for the container div */
  containerClassName?: string;
  /** Whether to show a required indicator (*) next to the label */
  showRequiredIndicator?: boolean;
  /** Threshold (0–1) for warning color on character count (default: 0.9) */
  countWarningThreshold?: number;
}

/**
 * Form textarea component with label, character count, and error handling.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      showCount = false,
      fullWidth = false,
      maxLength,
      value,
      disabled,
      required,
      showRequiredIndicator = required,
      countWarningThreshold = 0.9,
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    // Calculate current length
    const currentLength = typeof value === 'string' ? value.length : 0;

    // Determine which description to use for aria-describedby
    const descriptionIds = [];
    if (error) descriptionIds.push(errorId);
    if (helperText && !error) descriptionIds.push(helperId);
    if (ariaDescribedBy) descriptionIds.push(ariaDescribedBy);
    const describedBy = descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined;

    // Determine character count color
    const countColor = (): string => {
      if (!maxLength) return 'text-gray-500';
      const ratio = currentLength / maxLength;
      if (ratio >= 1) return 'text-red-600 font-semibold';
      if (ratio >= countWarningThreshold) return 'text-amber-600';
      return 'text-gray-500';
    };

    // Base textarea styles
    const textareaStyles = cn(
      'w-full px-4 py-3 bg-white border-2 rounded-lg',
      'text-moleskine-black placeholder-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'transition-all duration-200 resize-none',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
      'read-only:opacity-75 read-only:cursor-default read-only:bg-gray-50',
      // Border color based on state
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-moleskine-black focus:border-primary-500 focus:ring-primary-200',
      className
    );

    return (
      <div
        className={cn(
          'flex flex-col gap-1.5',
          fullWidth && 'w-full',
          containerClassName
        )}
      >
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-moleskine-black"
          >
            {label}
            {showRequiredIndicator && !disabled && (
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={textareaStyles}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...props}
        />

        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {error && (
              <p id={errorId} className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={helperId} className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>

          {showCount && maxLength && (
            <p
              className={cn('text-sm whitespace-nowrap', countColor())}
              aria-live="polite"
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
