import { Route, Routes, useLocation } from 'react-router-dom';
import Home from '../pages/Home/Home.jsx';
import Catalog from '../pages/Catalog/Catalog.jsx';
import Product from '../pages/Product/Product.jsx';
import Cart from '../pages/Cart/Cart.jsx';
import Login from '../pages/Login/Login.jsx';
import Registration from '../pages/Registration/Registration.jsx';
import Checkout from '../pages/Checkout/Checkout.jsx';

export default function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="*"
          element={<p className="notice">Сторінку не знайдено.</p>}
        />
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route path="/product/:id" element={<Product isModal />} />
        </Routes>
      )}
    </>
  );
}
