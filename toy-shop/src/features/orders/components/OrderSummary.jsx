import { Link } from 'react-router-dom';
import Button from '../../../shared/components/Button/Button.jsx';
import styles from './OrderSummary.module.css';

function getImageSource(image) {
  if (!image) return null;
  return image.startsWith('/')
    ? image
    : `/homepage/images/${encodeURIComponent(image)}`;
}

function formatPrice(value) {
  return `${Number(value).toLocaleString('uk-UA')} грн`;
}

export default function OrderSummary({
  items,
  goodsTotal,
  productsLoading = false,
  productsError = null,
  itemError = '',
  onRetry,
}) {
  return (
    <section
      aria-labelledby="checkout-summary-title"
      className={`panel ${styles.summary}`}
    >
      <h2 id="checkout-summary-title">Ваше замовлення</h2>
      {productsLoading && <p role="status">Завантаження актуальних товарів…</p>}
      {productsError && (
        <div className={styles.error} role="alert">
          <p>Не вдалося завантажити актуальні дані товарів.</p>
          <Button
            className={styles.retryButton}
            onClick={onRetry}
            type="button"
          >
            Спробувати ще раз
          </Button>
        </div>
      )}
      {!productsLoading && !productsError && (
        <ul className={styles.items}>
          {items.map((item) => {
            const imageSource = getImageSource(item.image);
            const lineTotal =
              item.available &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0
                ? item.price * item.quantity
                : null;
            return (
              <li className={styles.item} key={item.productId}>
                {imageSource ? (
                  <img
                    alt={item.name}
                    className={styles.image}
                    src={imageSource}
                  />
                ) : (
                  <span aria-hidden="true" className={styles.imageFallback}>
                    🧶
                  </span>
                )}
                <span className={styles.itemDetails}>
                  <strong>{item.name}</strong>
                  {item.available && (
                    <small>
                      {formatPrice(item.price)} за одиницю × {item.quantity}
                    </small>
                  )}
                  {!item.available && (
                    <small className={styles.unavailable}>
                      Товар недоступний
                    </small>
                  )}
                </span>
                <strong className={styles.lineTotal}>
                  {lineTotal === null ? '—' : formatPrice(lineTotal)}
                </strong>
              </li>
            );
          })}
        </ul>
      )}
      {itemError && (
        <div className={styles.error} role="alert">
          <p>{itemError}</p>
          <Link className={styles.cartLink} to="/cart">
            Переглянути кошик
          </Link>
        </div>
      )}
      <dl className={styles.totals}>
        <div>
          <dt>Товари</dt>
          <dd>{goodsTotal === null ? '—' : formatPrice(goodsTotal)}</dd>
        </div>
        <div>
          <dt>Доставка</dt>
          <dd>За тарифами служби</dd>
        </div>
        <div className={styles.grandTotal}>
          <dt>Разом без доставки</dt>
          <dd>{goodsTotal === null ? '—' : formatPrice(goodsTotal)}</dd>
        </div>
      </dl>
      <p className={styles.deliveryNote}>
        Вартість доставки оплачується окремо за тарифом обраної служби.
      </p>
    </section>
  );
}
