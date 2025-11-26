import { useState, useEffect } from 'react';
import { loadingStateManager } from '../services/api';

/**
 * Hook to track loading state for specific API calls
 * @param key - The loading state key to track (e.g., 'products.getAll')
 * @returns boolean indicating if the operation is loading
 */
export function useLoadingState(key: string): boolean {
  const [isLoading, setIsLoading] = useState(
    loadingStateManager.isLoading(key)
  );

  useEffect(() => {
    const unsubscribe = loadingStateManager.subscribe((states) => {
      setIsLoading(states[key] || false);
    });

    return unsubscribe;
  }, [key]);

  return isLoading;
}

/**
 * Hook to track multiple loading states
 * @param keys - Array of loading state keys to track
 * @returns Object with loading states for each key
 */
export function useLoadingStates(keys: string[]): Record<string, boolean> {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      keys.forEach(key => {
        initial[key] = loadingStateManager.isLoading(key);
      });
      return initial;
    }
  );

  useEffect(() => {
    const unsubscribe = loadingStateManager.subscribe((states) => {
      const newStates: Record<string, boolean> = {};
      keys.forEach(key => {
        newStates[key] = states[key] || false;
      });
      setLoadingStates(newStates);
    });

    return unsubscribe;
  }, [keys.join(',')]);

  return loadingStates;
}

/**
 * Hook to check if any API call is loading
 * @returns boolean indicating if any operation is loading
 */
export function useAnyLoading(): boolean {
  const [isAnyLoading, setIsAnyLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = loadingStateManager.subscribe((states) => {
      const anyLoading = Object.values(states).some(loading => loading);
      setIsAnyLoading(anyLoading);
    });

    return unsubscribe;
  }, []);

  return isAnyLoading;
}
