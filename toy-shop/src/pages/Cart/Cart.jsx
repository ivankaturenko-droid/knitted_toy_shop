import CartList from '../../features/cart/components/CartList.jsx';
import CartSummary from '../../features/cart/components/CartSummary.jsx';
import { useCart } from '../../features/cart/hooks/useCart.js';

export default function Cart() {
  const { items, total, setQuantity, removeFromCart } = useCart();

  return (
    <section>
      <h1 className="page-heading">Кошик</h1>
      {items.length === 0 ? (
        <p className="notice">
          Кошик поки порожній. Знайдіть іграшку в каталозі.
        </p>
      ) : (
        <>
          <CartList
            items={items}
            onQuantityChange={setQuantity}
            onRemove={removeFromCart}
          />
          <CartSummary total={total} />
        </>
      )}
    </section>
  );
}
