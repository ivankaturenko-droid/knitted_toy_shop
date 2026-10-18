import { Link } from 'react-router-dom';
import { useCart } from '../../features/cart/hooks/useCart.js';
import CartList from '../../features/cart/components/CartList.jsx';
import CartSummary from '../../features/cart/components/CartSummary.jsx';
import Button from '../../shared/components/Button/Button.jsx';
import styles from './Cart.module.css';

function formatItemCount(count) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const unit =
    lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? 'товарів'
      : lastDigit === 1
        ? 'товар'
        : lastDigit >= 2 && lastDigit <= 4
          ? 'товари'
          : 'товарів';

  return `${count} ${unit}`;
}

export default function Cart() {
  const { items, total, itemCount, setQuantity, removeFromCart } = useCart();

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Мій кошик</h1>
        <p className={styles.subtitle}>{formatItemCount(itemCount)}</p>
      </header>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <img
            alt=""
            className={styles.emptyIllustration}
            src="/homepage/images/yarn%201.svg"
          />
          <h2 className={styles.emptyTitle}>Ваш кошик поки порожній</h2>
          <p className={styles.emptyText}>
            Знайдіть у каталозі в’язаного друга, який вам сподобається.
          </p>
          <Button to="/catalog">Перейти до каталогу</Button>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.itemsColumn}>
            <CartList
              className={styles.list}
              items={items}
              onQuantityChange={setQuantity}
              onRemove={removeFromCart}
            />
          </div>
          <CartSummary itemCount={itemCount} total={total} />
        </div>
      )}

      {items.length > 0 && (
        <Link className={styles.continueLink} to="/catalog">
          ← Повернутися до каталогу
        </Link>
      )}
    </section>
  );
}
