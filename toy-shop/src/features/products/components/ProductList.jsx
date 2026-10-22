import ProductCard from './ProductCard.jsx';

export default function ProductList({ products, onAddToCart }) {
  if (products.length === 0) {
    return <p className="notice">Товарів поки не знайдено.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          onAddToCart={onAddToCart}
          product={product}
        />
      ))}
    </div>
  );
}
