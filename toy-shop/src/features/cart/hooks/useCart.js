import { createContext, createElement, useContext, useMemo } from 'react';
import {
  addItem,
  getCartItemCount,
  getCartTotal,
  updateQuantity,
} from '../cartUtils.js';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'knitted-toy-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage(STORAGE_KEY, [], Array.isArray);

  const value = useMemo(
    () => ({
      items,
      total: getCartTotal(items),
      itemCount: getCartItemCount(items),
      addToCart: (product) => setItems(addItem(items, product)),
      setQuantity: (id, quantity) =>
        setItems(updateQuantity(items, id, Number(quantity))),
      removeFromCart: (id) => setItems(items.filter((item) => item.id !== id)),
      clearCart: () => setItems([]),
    }),
    [items]
  );

  return createElement(CartContext.Provider, { value }, children);
}

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error('useCart потрібно використовувати всередині CartProvider.');
  }

  return cart;
}
