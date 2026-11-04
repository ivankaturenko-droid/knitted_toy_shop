import { useCallback, useState } from 'react';
import { API_BASE_PATH } from '../constants/api.js';

export function usePost() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = useCallback(async (path, payload, headers = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_PATH}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          result.message || 'Не вдалося надіслати дані на сервер.'
        );
      }
      setData(result);
      return result;
    } catch (requestError) {
      setError(requestError);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, post };
}
