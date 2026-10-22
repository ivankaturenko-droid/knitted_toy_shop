import CartItem from './CartItem.jsx';

export default function CartList({
  items,
  onQuantityChange,
  onRemove,
  className = '',
}) {
  return (
    <ul className={`cart-list ${className}`.trim()}>
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
