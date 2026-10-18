import { Link } from 'react-router-dom';
import styles from './CartSummary.module.css';

export default function CartSummary({ total, itemCount, className = '' }) {
  return (
    <aside className={`${styles.summary} ${className}`.trim()}>
      <h2 className={styles.title}>Підсумок замовлення</h2>
      <div className={styles.row}>
        <span>Товарів у кошику</span>
        <strong>{itemCount}</strong>
      </div>
      <div className={styles.row}>
        <span>Вартість товарів</span>
        <strong>{total} грн</strong>
      </div>
      <div className={styles.total}>
        <span>До сплати</span>
        <strong>{total} грн</strong>
      </div>
      <Link className={styles.checkout} to="/checkout">
        Оформити замовлення
      </Link>
    </aside>
  );
}
