export default function CartItem({ item, onQuantityChange, onRemove }) {
  return (
    <li className="cart-item">
      <div>
        <strong>{item.name}</strong>
        <div>{item.price} грн за штуку</div>
      </div>
      <label>
        Кількість{' '}
        <input
          className="cart-item__quantity"
          min="0"
          onChange={(event) => onQuantityChange(item.id, event.target.value)}
          type="number"
          value={item.quantity}
        />
      </label>
      <strong>{item.price * item.quantity} грн</strong>
      <button
        className="text-button"
        onClick={() => onRemove(item.id)}
        type="button"
      >
        Видалити
      </button>
    </li>
  );
}
