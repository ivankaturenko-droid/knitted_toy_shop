import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home/Home.jsx';
import Catalog from '../pages/Catalog/Catalog.jsx';
import Product from '../pages/Product/Product.jsx';
import Cart from '../pages/Cart/Cart.jsx';
import Login from '../pages/Login/Login.jsx';
import Registration from '../pages/Registration/Registration.jsx';
import Checkout from '../pages/Checkout/Checkout.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/product/:id?" element={<Product />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route
        path="*"
        element={<p className="notice">Сторінку не знайдено.</p>}
      />
    </Routes>
  );
}
