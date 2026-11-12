export function addItem(items, product, quantity = 1) {
  const amount = Math.max(1, Math.floor(Number(quantity) || 1));
  const existingItem = items.find((item) => item.id === product.id);

  if (existingItem) {
    return items.map((item) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + amount }
        : item
    );
  }

  return [...items, { ...product, quantity: amount }];
}

export function updateQuantity(items, productId, quantity) {
  const amount = Math.floor(Number(quantity));
  if (!Number.isFinite(amount)) return items;
  if (amount < 1) {
    return items.filter((item) => item.id !== productId);
  }

  return items.map((item) =>
    item.id === productId ? { ...item, quantity: amount } : item
  );
}

export function getCartTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartItemCount(items) {
  return items.reduce((count, item) => count + item.quantity, 0);
}
