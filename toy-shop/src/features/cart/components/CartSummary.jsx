import { Link } from 'react-router-dom';

export default function CartSummary({ total }) {
  return (
    <div className="cart-summary">
      <strong>Разом: {total} грн</strong>
      <Link className="button" to="/checkout">
        Оформити замовлення
      </Link>
    </div>
  );
}
