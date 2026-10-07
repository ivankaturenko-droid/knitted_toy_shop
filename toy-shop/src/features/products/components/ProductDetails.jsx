import yarnBall from '../../../assets/images/yarn-ball.svg';
import Button from '../../../shared/components/Button/Button.jsx';

export default function ProductDetails({ product, onAddToCart }) {
  return (
    <article className="panel stack">
      <div className="product-detail__image" aria-hidden="true">
        <img src={product.image || yarnBall} alt="" />
      </div>
      <div>
        <h1 className="page-heading">{product.name}</h1>
        <p>{product.description}</p>
        <p className="product-price">{product.price} грн</p>
      </div>
      <Button onClick={() => onAddToCart(product)}>Додати до кошика</Button>
    </article>
  );
}
