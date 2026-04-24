import { useState, useCallback } from 'react';
import { handleError, isAuthError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for consistent error handling across components
 */
export const useErrorHandler = (context?: string) => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Handle an error and set the error state
   */
  const handleErrorWithState = useCallback(
    (err: any) => {
      const errorMessage = handleError(err, context);
      setError(errorMessage);

      // Redirect to login on authentication errors
      if (isAuthError(err)) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

      return errorMessage;
    },
    [context, navigate]
  );

  /**
   * Clear the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Execute an async function with automatic error handling
   */
  const executeWithErrorHandling = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        clearError();
        return await fn();
      } catch (err) {
        handleErrorWithState(err);
        return null;
      }
    },
    [clearError, handleErrorWithState]
  );

  return {
    error,
    setError,
    clearError,
    handleError: handleErrorWithState,
    executeWithErrorHandling,
  };
};
