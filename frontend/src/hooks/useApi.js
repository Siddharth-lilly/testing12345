/**
 * Custom hook for API calls with loading and error states
 */

import { useState, useCallback } from 'react';

/**
 * useApi - Hook for handling API calls with loading/error states
 * 
 * @example
 * const { data, loading, error, execute } = useApi(api.getProject);
 * 
 * // Call the API
 * execute(projectId);
 */
export function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * useApiOnMount - Hook that calls API on component mount
 * 
 * @example
 * const { data, loading, error } = useApiOnMount(() => api.getProject(id), [id]);
 */
export function useApiOnMount(apiFunction, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, deps);

  // Initial fetch
  useState(() => {
    refetch();
  });

  return { data, loading, error, refetch };
}

export default useApi;
