import { API_BASE_PATH } from '../../../shared/constants/api.js';

const TOKEN_KEY = 'knitted-toy-token';
const USER_KEY = 'knitted-toy-user';

function withoutCredentials(user) {
  return Object.fromEntries(
    Object.entries(user).filter(
      ([key]) =>
        !['password', 'passwordHash', 'passwordSalt', 'salt'].includes(key)
    )
  );
}

function createSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

export async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
    throw new Error('Безпечне збереження пароля недоступне в цьому браузері.');
  }

  const passwordSalt = salt || createSalt();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const digest = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(passwordSalt),
      iterations: 120000,
      hash: 'SHA-256',
    },
    key,
    256
  );
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  return { passwordSalt, passwordHash: hash };
}

export async function migrateLegacyUser(user, password) {
  const credentials = await hashPassword(password);
  const response = await fetch(
    `${API_BASE_PATH}/users/${encodeURIComponent(user.id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...withoutCredentials(user), ...credentials }),
    }
  );
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || 'Не вдалося безпечно оновити дані користувача.'
    );
  }

  return result;
}

export function getSavedAuth() {
  try {
    const savedUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    return {
      token: localStorage.getItem(TOKEN_KEY),
      user: savedUser ? withoutCredentials(savedUser) : null,
    };
  } catch {
    return { token: null, user: null };
  }
}

export function saveAuth({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(withoutCredentials(user)));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
