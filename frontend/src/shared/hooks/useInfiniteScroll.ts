/**
 * Infinite Scroll Hook (Production Safe)
 *
 * Observes a sentinel element and triggers onLoadMore when visible.
 * Includes:
 * - Duplicate call protection
 * - SSR safety
 * - Observer reuse
 * - Throttle protection
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';

export interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  isLoading,
  root = null,
  rootMargin = '0px',
  threshold = 0,
  enabled = true,
}: UseInfiniteScrollOptions) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef(false);

  // Prevent duplicate trigger
  useEffect(() => {
    if (!isLoading) {
      isFetchingRef.current = false;
    }
  }, [isLoading]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];

      if (
        entry?.isIntersecting &&
        hasMore &&
        !isLoading &&
        enabled &&
        !isFetchingRef.current
      ) {
        isFetchingRef.current = true;
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore, enabled]
  );

  const observerOptions = useMemo(
    () => ({
      root,
      rootMargin,
      threshold,
    }),
    [root, rootMargin, threshold]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!enabled) return;
    if (!('IntersectionObserver' in window)) return;

    const element = loadMoreRef.current;
    if (!element) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      handleObserver,
      observerOptions
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [handleObserver, observerOptions, enabled]);

  const resetInfiniteScroll = useCallback(() => {
    if (!observerRef.current || !loadMoreRef.current) return;
    observerRef.current.unobserve(loadMoreRef.current);
    observerRef.current.observe(loadMoreRef.current);
  }, []);

  return {
    loadMoreRef,
    resetInfiniteScroll,
  };
};
