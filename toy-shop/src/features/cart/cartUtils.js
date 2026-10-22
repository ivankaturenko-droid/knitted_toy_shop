export function addItem(items, product, quantity = 1) {
  const existingItem = items.find((item) => item.id === product.id);

  if (existingItem) {
    return items.map((item) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  }

  return [...items, { ...product, quantity }];
}

export function updateQuantity(items, productId, quantity) {
  if (quantity <= 0) {
    return items.filter((item) => item.id !== productId);
  }

  return items.map((item) =>
    item.id === productId ? { ...item, quantity } : item
  );
}

export function getCartTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartItemCount(items) {
  return items.reduce((count, item) => count + item.quantity, 0);
}
