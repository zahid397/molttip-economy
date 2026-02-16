/**
 * Input Component
 *
 * A versatile input field with label, error messaging, helper text,
 * and icon support. Built with accessibility in mind.
 */

import React, { useId } from 'react';
import { cn } from '@/shared/utils/helpers';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message (also marks input as invalid) */
  error?: string;
  /** Helper text displayed below the input (when no error) */
  helperText?: string;
  /** Icon displayed at the start of the input */
  leftIcon?: React.ReactNode;
  /** Icon displayed at the end of the input */
  rightIcon?: React.ReactNode;
  /** Whether the input should take full width of its container */
  fullWidth?: boolean;
  /** Optional class name for the container div */
  containerClassName?: string;
  /** Whether to show a required indicator (*) next to the label */
  showRequiredIndicator?: boolean;
}

/**
 * Form input component with label, error handling, and icons.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      required,
      showRequiredIndicator = required,
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Determine which description to use for aria-describedby
    const descriptionIds = [];
    if (error) descriptionIds.push(errorId);
    if (helperText && !error) descriptionIds.push(helperId);
    if (ariaDescribedBy) descriptionIds.push(ariaDescribedBy);
    const describedBy = descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined;

    // Base input styles
    const inputStyles = cn(
      'w-full px-4 py-2 bg-white border-2 rounded-lg',
      'text-moleskine-black placeholder-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
      'read-only:opacity-75 read-only:cursor-default read-only:bg-gray-50',
      // Border color based on state
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-moleskine-black focus:border-primary-500 focus:ring-primary-200',
      // Padding for icons
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
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
            htmlFor={inputId}
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

        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputStyles}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...props}
          />

          {rightIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>

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
    );
  }
);

Input.displayName = 'Input';
