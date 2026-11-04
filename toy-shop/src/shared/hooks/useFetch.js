import { useCallback, useEffect, useState } from 'react';
import { API_BASE_PATH } from '../constants/api.js';

export function useFetch(initialPath = null, { immediate = true } = {}) {
  const [data, setData] = useState(initialPath ? [] : null);
  const [loading, setLoading] = useState(Boolean(initialPath && immediate));
  const [error, setError] = useState(null);
  const [responsePath, setResponsePath] = useState(null);

  const request = useCallback(
    async (path = initialPath, options = {}) => {
      if (!path) return null;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_PATH}${path}`, options);
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            result.message || 'Не вдалося отримати дані з сервера.'
          );
        }
        setData(result);
        setResponsePath(path);
        return result;
      } catch (requestError) {
        setResponsePath(path);
        setError(requestError);
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [initialPath]
  );

  useEffect(() => {
    if (!initialPath || !immediate) return;
    let active = true;
    queueMicrotask(() => {
      if (active) request(initialPath).catch(() => {});
    });
    return () => {
      active = false;
    };
  }, [immediate, initialPath, request]);

  const currentData =
    responsePath === initialPath ? data : initialPath ? [] : data;
  const isLoading =
    loading || Boolean(initialPath && responsePath !== initialPath);

  return { data: currentData, loading: isLoading, error, refetch: request };
}
