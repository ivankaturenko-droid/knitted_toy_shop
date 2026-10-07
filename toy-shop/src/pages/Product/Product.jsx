import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductDetails from '../../features/products/components/ProductDetails.jsx';
import { getProduct } from '../../features/products/services/productService.js';
import { useCart } from '../../features/cart/hooks/useCart.js';

export default function Product() {
  const { id } = useParams();
  const [result, setResult] = useState({ id: null, product: null, error: '' });
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;

    getProduct(id)
      .then((product) => setResult({ id, product, error: '' }))
      .catch((requestError) =>
        setResult({ id, product: null, error: requestError.message })
      );
  }, [id]);

  if (!id) {
    return (
      <p className="notice">Оберіть іграшку в каталозі, щоб побачити деталі.</p>
    );
  }
  if (result.id !== id) return <p>Завантажуємо товар...</p>;
  if (result.error)
    return <p className="form-message form-message--error">{result.error}</p>;
  if (!result.product) return <p className="notice">Товар не знайдено.</p>;

  return <ProductDetails onAddToCart={addToCart} product={result.product} />;
}
