import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../features/cart/hooks/useCart.js';
import OrderForm from '../../features/orders/components/OrderForm.jsx';
import OrderSummary from '../../features/orders/components/OrderSummary.jsx';
import { createOrder } from '../../features/orders/services/orderService.js';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState('');

  if (items.length === 0 && !orderNumber) {
    return (
      <section>
        <h1 className="page-heading">Оформлення замовлення</h1>
        <p className="notice">Додайте товари до кошика перед оформленням.</p>
        <Link className="button" to="/catalog">
          До каталогу
        </Link>
      </section>
    );
  }

  async function submitOrder(customer) {
    const order = await createOrder({
      ...customer,
      items: items.map(({ id, quantity }) => ({ productId: id, quantity })),
    });
    clearCart();
    setOrderNumber(order.id);
  }

  if (orderNumber) {
    return (
      <section>
        <h1 className="page-heading">Дякуємо за замовлення!</h1>
        <p className="notice">Номер вашого замовлення: {orderNumber}</p>
        <Link className="button" to="/catalog">
          Повернутися до каталогу
        </Link>
      </section>
    );
  }

  return (
    <section className="stack">
      <h1 className="page-heading">Оформлення замовлення</h1>
      <OrderSummary items={items} total={total} />
      <OrderForm onSubmit={submitOrder} />
    </section>
  );
}
