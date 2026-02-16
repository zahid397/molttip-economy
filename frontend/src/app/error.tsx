'use client';

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/Button';
import { Container } from '@/shared/components/layout/Container';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <Container className="py-16">
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="mb-8 p-6 bg-red-100 rounded-full">
          <AlertTriangle className="w-24 h-24 text-red-600" aria-hidden="true" />
        </div>

        <h1 className="text-4xl font-bold text-moleskine-black mb-4">
          Something went wrong!
        </h1>

        <p className="text-lg text-gray-600 mb-8 max-w-md">
          We encountered an unexpected error. Please try again.
        </p>

        {error.digest && (
          <p className="text-sm text-gray-500 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={reset} variant="primary" size="lg">
            Try Again
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            size="lg"
          >
            Go Home
          </Button>
        </div>

        {isDev && (
          <details className="mt-8 text-left max-w-2xl w-full">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
              Developer Details
            </summary>
            <pre className="p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </Container>
  );
}
