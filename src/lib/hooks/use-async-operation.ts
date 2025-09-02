import { useState, useCallback } from 'react';
import { useToast } from '../stores/toast-store';
import { useUIActions } from '../stores/ui-store';

interface AsyncOperationOptions {
  loadingKey?:
    | 'fetchingMovies'
    | 'fetchingMovieDetails'
    | 'searching'
    | 'authenticating';
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  useGlobalLoading?: boolean;
  globalLoadingMessage?: string;
}

interface AsyncOperationResult<T> {
  execute: (...args: unknown[]) => Promise<T | undefined>;
  loading: boolean;
  error: string | null;
  data: T | null;
  reset: () => void;
}

/**
 * Hook for handling async operations with loading states, error handling, and user feedback
 * Provides consistent UX patterns for all async operations in the app
 */
export function useAsyncOperation<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  options: AsyncOperationOptions = {}
): AsyncOperationResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const { showSuccess, showError } = useToast();
  const { setLoadingState, setGlobalLoading } = useUIActions();

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | undefined> => {
      try {
        setLoading(true);
        setError(null);

        // Set loading states
        if (options.loadingKey) {
          setLoadingState(options.loadingKey, true);
        }
        if (options.useGlobalLoading) {
          setGlobalLoading(true, options.globalLoadingMessage);
        }

        const result = await asyncFunction(...args);
        setData(result);

        // Show success toast if configured
        if (options.showSuccessToast && options.successMessage) {
          showSuccess(options.successMessage);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);

        // Show error toast if configured
        if (options.showErrorToast !== false) {
          const displayMessage = options.errorMessage || errorMessage;
          showError(displayMessage, 'Operation Failed');
        }

        return undefined;
      } finally {
        setLoading(false);

        // Clear loading states
        if (options.loadingKey) {
          setLoadingState(options.loadingKey, false);
        }
        if (options.useGlobalLoading) {
          setGlobalLoading(false);
        }
      }
    },
    [
      asyncFunction,
      options,
      showSuccess,
      showError,
      setLoadingState,
      setGlobalLoading,
    ]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * Hook for handling async operations that don't need to store data
 * Useful for actions like login, logout, delete operations, etc.
 */
export function useAsyncAction(
  asyncFunction: (...args: unknown[]) => Promise<void>,
  options: AsyncOperationOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showSuccess, showError } = useToast();
  const { setLoadingState, setGlobalLoading } = useUIActions();

  const execute = useCallback(
    async (...args: unknown[]): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        // Set loading states
        if (options.loadingKey) {
          setLoadingState(options.loadingKey, true);
        }
        if (options.useGlobalLoading) {
          setGlobalLoading(true, options.globalLoadingMessage);
        }

        await asyncFunction(...args);

        // Show success toast if configured
        if (options.showSuccessToast && options.successMessage) {
          showSuccess(options.successMessage);
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);

        // Show error toast if configured
        if (options.showErrorToast !== false) {
          const displayMessage = options.errorMessage || errorMessage;
          showError(displayMessage, 'Action Failed');
        }

        return false;
      } finally {
        setLoading(false);

        // Clear loading states
        if (options.loadingKey) {
          setLoadingState(options.loadingKey, false);
        }
        if (options.useGlobalLoading) {
          setGlobalLoading(false);
        }
      }
    },
    [
      asyncFunction,
      options,
      showSuccess,
      showError,
      setLoadingState,
      setGlobalLoading,
    ]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    execute,
    loading,
    error,
    reset,
  };
}
