import styles from './CartItem.module.css';
import demoProducts from '../../products/data/demoProducts.js';

function imageSource(image) {
  if (!image) return null;
  return image.startsWith('/')
    ? image
    : `/homepage/images/${encodeURIComponent(image)}`;
}

export default function CartItem({ item, onQuantityChange, onRemove }) {
  const savedProduct = demoProducts.find((product) => product.id === item.id);
  const source = imageSource(item.image || savedProduct?.image);

  return (
    <li className={styles.item}>
      {source ? (
        <img alt={item.name} className={styles.image} src={source} />
      ) : (
        <div className={styles.imagePlaceholder}>
          <img alt="" src="/homepage/images/yarn%201.svg" />
          <span className="visually-hidden">Фото товару відсутнє</span>
        </div>
      )}
      <div className={styles.product}>
        <h2 className={styles.name}>{item.name}</h2>
        <p className={styles.unitPrice}>{item.price} грн за одиницю</p>
      </div>
      <div className={styles.quantityGroup}>
        <span className={styles.label}>Кількість</span>
        <div className={styles.quantityControl}>
          <button
            aria-label={`Зменшити кількість товару «${item.name}»`}
            className={styles.quantityButton}
            disabled={item.quantity <= 1}
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            type="button"
          >
            −
          </button>
          <span aria-live="polite" className={styles.quantity}>
            {item.quantity}
          </span>
          <button
            aria-label={`Збільшити кількість товару «${item.name}»`}
            className={styles.quantityButton}
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            type="button"
          >
            +
          </button>
        </div>
      </div>
      <div className={styles.lineTotal}>
        <span className={styles.label}>Вартість</span>
        <strong>{item.price * item.quantity} грн</strong>
      </div>
      <button
        aria-label={`Видалити товар «${item.name}» з кошика`}
        className={styles.removeButton}
        onClick={() => onRemove(item.id)}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 3v7m6-7v7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        <span>Видалити</span>
      </button>
    </li>
  );
}
