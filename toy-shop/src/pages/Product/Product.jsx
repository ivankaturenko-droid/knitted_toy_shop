import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import demoProducts from '../../features/products/data/demoProducts.js';
import { useCart } from '../../features/cart/hooks/useCart.js';
import Button from '../../shared/components/Button/Button.jsx';
import decor from '../../styles/brand-decorations.module.css';
import styles from './Product.module.css';

export default function Product({ isModal = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const product =
    demoProducts.find((item) => item.id === id) ?? demoProducts[0];

  useEffect(() => {
    if (!isModal) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape') navigate(-1);
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModal, navigate]);

  function closeModal(event) {
    if (event.target === event.currentTarget) navigate(-1);
  }

  const productContent = (
    <article
      className={`${styles.page}${isModal ? ` ${styles.modalContent}` : ''}`}
    >
      <div className={styles.gallery}>
        {product.image ? (
          <img
            alt={product.name}
            className={styles.mainImage}
            src={product.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>Місце для фото товару</div>
        )}
        <div aria-hidden="true" className={styles.thumbs}>
          <span className={styles.thumb} />
          <span className={styles.thumb} />
          <span className={styles.thumb} />
          <span className={styles.thumb} />
        </div>
      </div>
      <div className={styles.info}>
        <p className={styles.breadcrumb}>
          <Link to="/catalog">Каталог</Link> / Іграшки / {product.name}
        </p>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.price}>{product.price} грн</p>
        <h2 className={styles.sectionTitle}>Опис</h2>
        <p className={styles.description}>
          {product.description} Іграшка зв’язана вручну з м’якої пряжі та стане
          затишним подарунком для близької людини.
        </p>
        <h2 className={styles.sectionTitle}>Характеристики</h2>
        <p className={styles.meta}>Розмір: 18 см</p>
        <p className={styles.meta}>Матеріал: плюшева пряжа</p>
        <label className={styles.quantityLabel}>
          Кількість
          <input
            className={styles.quantity}
            onChange={(event) =>
              setQuantity(Math.max(1, Number(event.target.value) || 1))
            }
            value={quantity}
            min="1"
            type="number"
          />
        </label>
        <Button
          className={styles.action}
          onClick={() => {
            addToCart(product, quantity);
            setAdded(true);
          }}
          type="button"
        >
          {added ? 'Додано в кошик' : 'Додати в кошик'}
        </Button>
      </div>
    </article>
  );

  if (isModal) {
    return (
      <div className={styles.modalBackdrop} onMouseDown={closeModal}>
        <div
          aria-label={`Іграшка ${product.name}`}
          aria-modal="true"
          className={styles.modalDialog}
          role="dialog"
        >
          <button
            aria-label="Закрити деталі товару"
            className={styles.closeButton}
            onClick={() => navigate(-1)}
            type="button"
          >
            ×
          </button>
          {productContent}
        </div>
      </div>
    );
  }

  return <section className={decor.pageDecor}>{productContent}</section>;
}
