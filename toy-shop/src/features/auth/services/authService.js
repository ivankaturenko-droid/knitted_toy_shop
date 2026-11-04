const TOKEN_KEY = 'knitted-toy-token';
const USER_KEY = 'knitted-toy-user';

export function getSavedAuth() {
  try {
    return {
      token: localStorage.getItem(TOKEN_KEY),
      user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    };
  } catch {
    return { token: null, user: null };
  }
}

export function saveAuth({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
