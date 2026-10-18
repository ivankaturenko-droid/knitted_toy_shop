import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../../../shared/components/Button/Button.jsx';
import styles from './ProductCard.module.css';

function getImageSource(image) {
  if (!image) return null;
  return image.startsWith('/')
    ? image
    : `/homepage/images/${encodeURIComponent(image)}`;
}

export default function ProductCard({ product, onAddToCart }) {
  const location = useLocation();
  const [addedAt, setAddedAt] = useState(0);
  const [imageAspectRatio, setImageAspectRatio] = useState('4 / 5');
  const imageSource = getImageSource(product.image);
  const price =
    typeof product.price === 'number' ? `${product.price} грн` : product.price;

  useEffect(() => {
    if (!addedAt) return undefined;
    const timer = window.setTimeout(() => setAddedAt(0), 1600);
    return () => window.clearTimeout(timer);
  }, [addedAt]);

  function handleAddToCart() {
    onAddToCart(product);
    setAddedAt(Date.now());
  }

  return (
    <article className={styles.card}>
      <Link
        aria-label={`Детальніше про товар «${product.name}»`}
        className={styles.imageLink}
        state={product.id ? { backgroundLocation: location } : undefined}
        style={{ aspectRatio: imageAspectRatio }}
        to={product.id ? `/product/${product.id}` : '/catalog'}
      >
        {imageSource ? (
          <img
            alt={product.alt || product.name}
            className={styles.image}
            onLoad={(event) => {
              const { naturalHeight, naturalWidth } = event.currentTarget;
              setImageAspectRatio(`${naturalWidth} / ${naturalHeight}`);
            }}
            src={imageSource}
          />
        ) : (
          <span className={styles.imagePlaceholder}>
            Фото товару скоро з’явиться
          </span>
        )}
      </Link>
      <div className={styles.details}>
        <h2 className={styles.name}>{product.name}</h2>
        <p className={styles.description}>
          {product.description ||
            'В’язана іграшка ручної роботи — затишний друг для щоденних пригод.'}
        </p>
        <p className={styles.price}>Ціна: {price}</p>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.detailsButton}
          state={product.id ? { backgroundLocation: location } : undefined}
          to={product.id ? `/product/${product.id}` : '/catalog'}
        >
          Детальніше
        </Button>
        {onAddToCart ? (
          <Button
            aria-live="polite"
            className={styles.addButton}
            onClick={handleAddToCart}
          >
            {addedAt ? 'Додано в кошик' : 'Додати в кошик'}
          </Button>
        ) : (
          <Button className={styles.addButton} to="/catalog">
            Переглянути в каталозі
          </Button>
        )}
      </div>
    </article>
  );
}
