import { useState } from 'react';
import ProductList from '../../features/products/components/ProductList.jsx';
import { useCart } from '../../features/cart/hooks/useCart.js';
import demoProducts from '../../features/products/data/demoProducts.js';
import Search from '../../shared/components/Search/Search.jsx';
import decor from '../../styles/brand-decorations.module.css';
import styles from './Catalog.module.css';

const categories = [
  'Іграшки',
  'Подарунки',
  'Колекції',
  'Іграшки під замовлення',
];

function getCategoryProducts(products, category) {
  if (category === 'Іграшки') return products;
  return products.filter((product) => product.categories?.includes(category));
}

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [query, setQuery] = useState('');
  const { addToCart } = useCart();
  const normalizedQuery = query.trim().toLocaleLowerCase('uk');
  const visibleProducts = getCategoryProducts(
    demoProducts,
    activeCategory
  ).filter((product) =>
    [product.name, product.description]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase('uk').includes(normalizedQuery))
  );

  return (
    <div className={`${decor.pageDecor} ${styles.decor}`}>
      <section className={styles.page}>
        <h1 className={styles.heading}>Каталог</h1>
        <Search
          className={styles.search}
          label="Пошук іграшок"
          onChange={(event) => setQuery(event.target.value)}
          value={query}
        />
        <nav aria-label="Категорії каталогу" className={styles.categoryBar}>
          {categories.map((category) => (
            <button
              aria-pressed={activeCategory === category}
              className={`${styles.categoryLink}${activeCategory === category ? ` ${styles.categoryLinkActive}` : ''}`}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </nav>
        {visibleProducts.length > 0 ? (
          <div className={styles.productDecor}>
            <span
              aria-hidden="true"
              className={`${styles.productBerry} ${styles.productBerryLeft}`}
            />
            <span
              aria-hidden="true"
              className={`${styles.productBerry} ${styles.productBerryRight}`}
            />
            <span
              aria-hidden="true"
              className={`${styles.productBerry} ${styles.productBerryLeftBottom}`}
            />
            <ProductList
              className={styles.grid}
              onAddToCart={addToCart}
              products={visibleProducts}
            />
          </div>
        ) : (
          <p className={styles.noResults}>
            За цим запитом іграшок не знайдено.
          </p>
        )}
      </section>
    </div>
  );
}
