/**
 * 404 Not Found Page
 *
 * Displayed when a route does not match any page.
 * Provides navigation back to known pages.
 */

import React from 'react';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Container } from '@/shared/components/layout/Container';
import { cn } from '@/shared/utils/helpers';

export default function NotFound() {
  return (
    <Container className="py-16">
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="mb-8 p-6 bg-moleskine-tan rounded-full">
          <FileQuestion
            className="w-24 h-24 text-moleskine-black"
            aria-hidden="true"
          />
        </div>

        <h1 className="text-6xl font-bold text-moleskine-black mb-4">404</h1>

        <h2 className="text-3xl font-bold text-moleskine-black mb-4">
          Page Not Found
        </h2>

        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Sorry, we couldn't find the page you're looking for. It might have been
          moved or doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className={cn(
              'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg',
              'px-6 py-3 text-lg',
              'bg-primary-600 text-white hover:bg-primary-700',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
            )}
          >
            Go Home
          </Link>

          <Link
            href="/leaderboard"
            className={cn(
              'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg',
              'px-6 py-3 text-lg',
              'border-2 border-moleskine-black text-moleskine-black',
              'hover:bg-moleskine-black hover:text-moleskine-cream',
              'focus:outline-none focus:ring-2 focus:ring-moleskine-black focus:ring-offset-2'
            )}
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </Container>
  );
}
