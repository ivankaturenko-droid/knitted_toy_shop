import {
  createContext,
  createElement,
  useContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useFetch } from '../../../shared/hooks/useFetch.js';
import { usePost } from '../../../shared/hooks/usePost.js';
import {
  clearAuth,
  getSavedAuth,
  hashPassword,
  migrateLegacyUser,
  saveAuth,
} from '../services/authService.js';

const AuthContext = createContext(null);

function withoutCredentials(user) {
  return Object.fromEntries(
    Object.entries(user).filter(
      ([key]) =>
        !['password', 'passwordHash', 'passwordSalt', 'salt'].includes(key)
    )
  );
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getSavedAuth);
  const { refetch: fetchUsers } = useFetch(null, { immediate: false });
  const { post } = usePost();

  const signIn = useCallback(
    async (credentials) => {
      const email = credentials.email.trim().toLowerCase();
      const users = await fetchUsers(
        `/users?email=${encodeURIComponent(email)}`
      );
      const foundUser = users.find(
        (entry) => entry.email?.trim().toLowerCase() === email
      );
      if (!foundUser) {
        throw new Error('Електронна пошта або пароль неправильні.');
      }

      let authenticatedUser = foundUser;
      if (authenticatedUser.passwordHash && authenticatedUser.passwordSalt) {
        const { passwordHash } = await hashPassword(
          credentials.password,
          authenticatedUser.passwordSalt
        );
        if (passwordHash !== authenticatedUser.passwordHash) {
          throw new Error('Електронна пошта або пароль неправильні.');
        }
      } else if (authenticatedUser.password === credentials.password) {
        authenticatedUser = await migrateLegacyUser(
          authenticatedUser,
          credentials.password
        );
      } else {
        throw new Error('Електронна пошта або пароль неправильні.');
      }

      const token = crypto.randomUUID();
      const result = {
        token,
        user: withoutCredentials(authenticatedUser),
      };
      saveAuth(result);
      setAuth(result);
    },
    [fetchUsers]
  );

  const signUp = useCallback(
    async (details) => {
      const name = details.name?.trim();
      const email = details.email?.trim().toLowerCase();
      const password = details.password;
      if (!name || !email || !password)
        throw new Error('Заповніть усі обов’язкові поля.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error('Введіть коректну електронну адресу.');
      const existingUsers = await fetchUsers(
        `/users?email=${encodeURIComponent(email)}`
      );
      if (
        existingUsers.some((user) => user.email?.trim().toLowerCase() === email)
      )
        throw new Error('Користувач із такою поштою вже існує.');

      const passwordCredentials = await hashPassword(password);
      const createdUser = await post('/users', {
        name,
        email,
        ...passwordCredentials,
      });
      const result = {
        token: crypto.randomUUID(),
        user: withoutCredentials(createdUser),
      };
      saveAuth(result);
      setAuth(result);
    },
    [fetchUsers, post]
  );

  const logout = useCallback(() => {
    clearAuth();
    setAuth({ token: null, user: null });
  }, []);

  const updateUser = useCallback(
    (user) => {
      const result = { ...auth, user };
      saveAuth(result);
      setAuth(result);
    },
    [auth]
  );

  const value = useMemo(
    () => ({
      ...auth,
      signIn,
      signUp,
      logout,
      updateUser,
    }),
    [auth, signIn, signUp, logout, updateUser]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('useAuth потрібно використовувати всередині AuthProvider.');
  }

  return auth;
}
