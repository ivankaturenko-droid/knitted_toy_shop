import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../../features/cart/hooks/useCart.js';
import { useFetch } from '../../shared/hooks/useFetch.js';
import Button from '../../shared/components/Button/Button.jsx';
import QuantityControl from '../../shared/components/QuantityControl/QuantityControl.jsx';
import decor from '../../styles/brand-decorations.module.css';
import styles from './Product.module.css';

export default function Product({ isModal = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const {
    data: product,
    loading,
    error,
    refetch,
  } = useFetch(`/products/${encodeURIComponent(id)}`);

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

  if (loading) return <p role="status">Завантаження товару…</p>;
  if (error || !product) {
    return (
      <section className={decor.pageDecor}>
        <p role="alert">
          {error
            ? `Не вдалося завантажити товар: ${error.message}`
            : 'Товар не знайдено.'}
        </p>
        {error && (
          <button onClick={() => refetch().catch(() => {})} type="button">
            Спробувати ще раз
          </button>
        )}
        <Link to="/catalog">Повернутися до каталогу</Link>
      </section>
    );
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
        <QuantityControl
          className={styles.quantityGroup}
          decreaseLabel={`Зменшити кількість товару «${product.name}»`}
          increaseLabel={`Збільшити кількість товару «${product.name}»`}
          onChange={setQuantity}
          value={quantity}
        />
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
