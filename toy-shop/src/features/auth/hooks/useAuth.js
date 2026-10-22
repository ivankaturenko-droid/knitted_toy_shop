import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  clearAuth,
  getSavedAuth,
  loginUser,
  registerUser,
  saveAuth,
} from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getSavedAuth);

  async function signIn(credentials) {
    const result = await loginUser(credentials);
    saveAuth(result);
    setAuth({ token: result.token, user: result.user });
  }

  async function signUp(details) {
    const result = await registerUser(details);
    saveAuth(result);
    setAuth({ token: result.token, user: result.user });
  }

  function logout() {
    clearAuth();
    setAuth({ token: null, user: null });
  }

  const value = useMemo(
    () => ({
      ...auth,
      signIn,
      signUp,
      logout,
    }),
    [auth]
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
