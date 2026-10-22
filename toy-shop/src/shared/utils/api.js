import { API_BASE_PATH } from '../constants/api.js';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_PATH}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || 'Не вдалося виконати запит до сервера.');
  }

  return result;
}
