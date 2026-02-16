/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in its child component tree,
 * logs them, and displays a fallback UI. Can be customized via props.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { AlertTriangle, Copy } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showCopyButton?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleCopyDetails = async () => {
    if (!this.state.error) return;

    try {
      await navigator.clipboard.writeText(
        `${this.state.error.toString()}\n${this.state.error.stack || ''}`
      );
    } catch (e) {
      console.error('Failed to copy error details:', e);
    }
  };

  public render() {
    const { showCopyButton = true } = this.props;

    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-moleskine-cream p-4">
          <div className="max-w-md w-full bg-white border-2 border-moleskine-black rounded-lg p-8 text-center">
            <div className="mb-4 p-4 bg-red-100 rounded-full inline-block">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-moleskine-black mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto relative">
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>

                  {showCopyButton && (
                    <button
                      onClick={this.handleCopyDetails}
                      className="absolute top-2 right-2 p-1 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Copy error details"
                      type="button"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="primary">
                Try Again
              </Button>
              <Button onClick={() => (window.location.href = '/')} variant="outline">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
