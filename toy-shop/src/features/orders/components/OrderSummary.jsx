export default function OrderSummary({ items, total }) {
  return (
    <section className="panel">
      <h2>Ваше замовлення</h2>
      <ul className="stack">
        {items.map((item) => (
          <li className="order-item" key={item.id}>
            <span>
              {item.name} × {item.quantity}
            </span>
            <strong>{item.price * item.quantity} грн</strong>
          </li>
        ))}
      </ul>
      <p className="product-price">Разом: {total} грн</p>
    </section>
  );
}
