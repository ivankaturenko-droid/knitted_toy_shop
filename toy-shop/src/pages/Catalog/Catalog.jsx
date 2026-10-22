import { useEffect, useState } from 'react';
import ProductList from '../../features/products/components/ProductList.jsx';
import { getProducts } from '../../features/products/services/productService.js';
import { useCart } from '../../features/cart/hooks/useCart.js';
import Search from '../../shared/components/Search/Search.jsx';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name
      .toLocaleLowerCase('uk')
      .includes(search.toLocaleLowerCase('uk'))
  );

  return (
    <section>
      <h1 className="page-heading">Каталог іграшок</h1>
      <p className="page-intro">
        Знайдіть нового в’язаного друга для себе чи на подарунок.
      </p>
      <Search onChange={setSearch} value={search} />
      {isLoading && <p>Завантажуємо каталог...</p>}
      {error && <p className="form-message form-message--error">{error}</p>}
      {!isLoading && !error && (
        <ProductList onAddToCart={addToCart} products={filteredProducts} />
      )}
    </section>
  );
}
