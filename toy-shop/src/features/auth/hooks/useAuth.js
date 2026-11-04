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
import { clearAuth, getSavedAuth, saveAuth } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getSavedAuth);
  const { refetch: fetchUsers } = useFetch(null, { immediate: false });
  const { post } = usePost();

  const signIn = useCallback(
    async (credentials) => {
      const users = await fetchUsers(
        `/users?email=${encodeURIComponent(credentials.email.trim().toLowerCase())}`
      );
      const user = users.find(
        (entry) => entry.password === credentials.password
      );
      if (!user) throw new Error('Електронна пошта або пароль неправильні.');

      const token = crypto.randomUUID();
      const result = {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      };
      saveAuth(result);
      setAuth(result);
    },
    [fetchUsers]
  );

  const signUp = useCallback(
    async (details) => {
      const email = details.email.trim().toLowerCase();
      const existingUsers = await fetchUsers(
        `/users?email=${encodeURIComponent(email)}`
      );
      if (existingUsers.length)
        throw new Error('Користувач із такою поштою вже існує.');

      const createdUser = await post('/users', { ...details, email });
      const result = {
        token: crypto.randomUUID(),
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
        },
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

  const value = useMemo(
    () => ({
      ...auth,
      signIn,
      signUp,
      logout,
    }),
    [auth, signIn, signUp, logout]
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
