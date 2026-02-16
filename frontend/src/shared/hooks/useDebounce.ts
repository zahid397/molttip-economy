/**
 * Debounce Hook
 *
 * Delays updating a value until after a specified delay has passed
 * since the last change.
 *
 * Supports:
 * - leading
 * - trailing
 * - maxWait
 */

import { useEffect, useRef, useState } from 'react';

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function useDebounce<T>(
  value: T,
  delay: number = 500,
  options: DebounceOptions = {}
): T {
  const { leading = false, trailing = true, maxWait } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const valueRef = useRef(value);
  valueRef.current = value;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasInvokedLeadingRef = useRef(false);

  // Cleanup timers
  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (maxWaitTimerRef.current) {
      clearTimeout(maxWaitTimerRef.current);
      maxWaitTimerRef.current = null;
    }
  };

  useEffect(() => {
    // If leading enabled and this is the first call in a burst
    if (leading && !hasInvokedLeadingRef.current) {
      setDebouncedValue(valueRef.current);
      hasInvokedLeadingRef.current = true;
    }

    // Clear existing trailing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Trailing update
    if (trailing) {
      timerRef.current = setTimeout(() => {
        setDebouncedValue(valueRef.current);
        hasInvokedLeadingRef.current = false;
        timerRef.current = null;

        // reset maxWait timer after flush
        if (maxWaitTimerRef.current) {
          clearTimeout(maxWaitTimerRef.current);
          maxWaitTimerRef.current = null;
        }
      }, delay);
    }

    // maxWait enforcement
    if (maxWait && !maxWaitTimerRef.current) {
      maxWaitTimerRef.current = setTimeout(() => {
        setDebouncedValue(valueRef.current);
        hasInvokedLeadingRef.current = false;

        // clear trailing timer if maxWait triggers first
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        maxWaitTimerRef.current = null;
      }, maxWait);
    }

    return () => {
      // only clear trailing timer on each change
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delay, leading, trailing, maxWait]);

  // Full cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, []);

  return debouncedValue;
}
