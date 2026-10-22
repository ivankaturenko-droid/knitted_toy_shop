import { Link } from 'react-router-dom';
import yarnBall from '../../../assets/images/yarn-ball.svg';
import Button from '../../../shared/components/Button/Button.jsx';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <div className="product-card__image" aria-hidden="true">
        <img src={product.image || yarnBall} alt="" />
      </div>
      <div className="product-card__body">
        <h2 className="product-card__title">{product.name}</h2>
        <p>{product.description}</p>
        <div className="product-card__actions">
          <span className="product-price">{product.price} грн</span>
          <Link to={`/product/${product.id}`}>Детальніше</Link>
          {onAddToCart && (
            <Button onClick={() => onAddToCart(product)}>До кошика</Button>
          )}
        </div>
      </div>
    </article>
  );
}
