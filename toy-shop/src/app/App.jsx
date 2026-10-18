import { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../features/auth/hooks/useAuth.js';
import { CartProvider, useCart } from '../features/cart/hooks/useCart.js';
import Footer from '../shared/components/Footer/Footer.jsx';
import Header from '../shared/components/Header/Header.jsx';
import AuthPage from '../pages/Auth/AuthPage.jsx';
import AppRoutes from './routes.jsx';
import './App.css';

function AppContent() {
  const cart = useCart();
  const auth = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [showWelcomeAuth, setShowWelcomeAuth] = useState(
    () =>
      location.pathname === '/' &&
      !auth.user &&
      !sessionStorage.getItem('auth-prompt-dismissed')
  );

  function closeWelcomeAuth() {
    sessionStorage.setItem('auth-prompt-dismissed', 'true');
    setShowWelcomeAuth(false);
  }

  return (
    <div className={`app-shell${isHome ? ' app-shell--home' : ''}`}>
      <Header
        cartCount={cart.itemCount}
        user={auth.user}
        onLogout={auth.logout}
        isHome={isHome}
      />
      <main
        className={isHome ? 'page-content page-content--home' : 'page-content'}
      >
        <AppRoutes />
      </main>
      <Footer isHome={isHome} />
      {showWelcomeAuth && (
        <div
          className="auth-prompt-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeWelcomeAuth();
          }}
        >
          <div
            aria-label={
              location.pathname === '/login' ? 'Вхід до акаунту' : 'Реєстрація'
            }
            aria-modal="true"
            className="auth-prompt-dialog"
            role="dialog"
          >
            <AuthPage
              isModal
              mode={location.pathname === '/login' ? 'login' : 'registration'}
              onClose={closeWelcomeAuth}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
