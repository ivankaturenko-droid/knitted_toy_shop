import CartItem from './CartItem.jsx';

export default function CartList({ items, onQuantityChange, onRemove }) {
  return (
    <ul className="cart-list">
      {items.map((item) => (
        <CartItem
          item={item}
          key={item.id}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
