/**
 * Validation Utilities
 *
 * Provides Zod schemas and helper functions for consistent validation
 * across the application.
 */

import { z } from 'zod';
import {
  MAX_POST_LENGTH,
  MAX_COMMENT_LENGTH,
  MAX_BIO_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_TIP_AMOUNT,
  MAX_TIP_AMOUNT,
} from '@/shared/constants';

/* ─────────────────────────────────────────────── */
/* ✅ Validation Schemas */
/* ─────────────────────────────────────────────── */

/**
 * Post creation/update schema
 */
export const postSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Post content is required')
    .max(MAX_POST_LENGTH, `Post cannot exceed ${MAX_POST_LENGTH} characters`),

  imageUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

/**
 * Comment creation schema
 */
export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment is required')
    .max(
      MAX_COMMENT_LENGTH,
      `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`
    ),
});

/**
 * Tip creation schema
 */
export const tipSchema = z.object({
  amount: z
    .number()
    .min(MIN_TIP_AMOUNT, `Minimum tip is ${MIN_TIP_AMOUNT}`)
    .max(MAX_TIP_AMOUNT, `Maximum tip is ${MAX_TIP_AMOUNT}`),

  message: z
    .string()
    .trim()
    .max(200, 'Message cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Profile update schema
 */
export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(
      MAX_USERNAME_LENGTH,
      `Username cannot exceed ${MAX_USERNAME_LENGTH} characters`
    )
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    )
    .refine((val) => !val.includes('__'), {
      message: 'Username cannot contain consecutive underscores',
    })
    .refine((val) => !val.startsWith('_') && !val.endsWith('_'), {
      message: 'Username cannot start or end with underscore',
    }),

  bio: z
    .string()
    .trim()
    .max(MAX_BIO_LENGTH, `Bio cannot exceed ${MAX_BIO_LENGTH} characters`)
    .optional()
    .or(z.literal('')),

  avatar: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

/* ─────────────────────────────────────────────── */
/* 🧠 Derived Types */
/* ─────────────────────────────────────────────── */

export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type TipInput = z.infer<typeof tipSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

/* ─────────────────────────────────────────────── */
/* 🔍 Validation Helpers */
/* ─────────────────────────────────────────────── */

/**
 * Checks if a string is a valid URL.
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Checks if a string is a valid Ethereum address.
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Sanitizes input by trimming and collapsing extra spaces.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Generic schema validator wrapper
 */
export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T; errors: null } | { success: false; data: null; errors: Record<string, string[]> } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }

  return {
    success: false,
    data: null,
    errors: result.error.flatten().fieldErrors as Record<string, string[]>,
  };
};
