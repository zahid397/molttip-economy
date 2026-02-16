/**
 * Local Storage Hook
 *
 * Persistent state synchronized with localStorage.
 * - SSR safe
 * - Cross-tab synchronization
 * - Error resilient
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// Utilities
// ============================================================================

const isBrowser = typeof window !== 'undefined';

function resolveInitialValue<T>(value: T | (() => T)): T {
  return value instanceof Function ? value() : value;
}

// ============================================================================
// Hook
// ============================================================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  const keyRef = useRef(key);
  keyRef.current = key;

  const initialRef = useRef(initialValue);
  initialRef.current = initialValue;

  // --------------------------------------------------------------------------
  // State Initialization
  // --------------------------------------------------------------------------

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isBrowser) {
      return resolveInitialValue(initialValue);
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }

      const valueToStore = resolveInitialValue(initialValue);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    } catch (error) {
      console.error(`[useLocalStorage] Read error for "${key}":`, error);
      return resolveInitialValue(initialValue);
    }
  });

  // --------------------------------------------------------------------------
  // Persist to localStorage when state changes
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!isBrowser) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`[useLocalStorage] Write error for "${key}":`, error);
    }
  }, [key, storedValue]);

  // --------------------------------------------------------------------------
  // Sync across tabs
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!isBrowser) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== keyRef.current) return;

      try {
        if (event.newValue === null) {
          setStoredValue(resolveInitialValue(initialRef.current));
        } else {
          setStoredValue(JSON.parse(event.newValue));
        }
      } catch (error) {
        console.error(`[useLocalStorage] Sync error for "${keyRef.current}":`, error);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // --------------------------------------------------------------------------
  // Setter
  // --------------------------------------------------------------------------

  const setValue = useCallback(
    (value: T | ((prevValue: T) => T)) => {
      setStoredValue((prev) => {
        try {
          return value instanceof Function ? value(prev) : value;
        } catch (error) {
          console.error(`[useLocalStorage] Setter error for "${keyRef.current}":`, error);
          return prev;
        }
      });
    },
    []
  );

  // --------------------------------------------------------------------------
  // Remove
  // --------------------------------------------------------------------------

  const removeValue = useCallback(() => {
    if (!isBrowser) return;

    try {
      window.localStorage.removeItem(keyRef.current);
      setStoredValue(resolveInitialValue(initialRef.current));
    } catch (error) {
      console.error(`[useLocalStorage] Remove error for "${keyRef.current}":`, error);
    }
  }, []);

  return [storedValue, setValue, removeValue];
}
