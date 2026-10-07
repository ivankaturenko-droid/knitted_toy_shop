import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../features/auth/hooks/useAuth.js';
import { CartProvider, useCart } from '../features/cart/hooks/useCart.js';
import Footer from '../shared/components/Footer/Footer.jsx';
import Header from '../shared/components/Header/Header.jsx';
import AppRoutes from './routes.jsx';
import './App.css';

function AppContent() {
  const cart = useCart();
  const auth = useAuth();

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header
          cartCount={cart.itemCount}
          user={auth.user}
          onLogout={auth.logout}
        />
        <main className="page-content">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
