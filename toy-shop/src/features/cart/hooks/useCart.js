import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  addItem,
  getCartItemCount,
  getCartTotal,
  updateQuantity,
} from '../cartUtils.js';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage.js';
import { useAuth } from '../../auth/hooks/useAuth.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'knitted-toy-carts-by-user';

function getInitialCarts() {
  try {
    const savedCarts = localStorage.getItem(STORAGE_KEY);
    if (savedCarts !== null) return JSON.parse(savedCarts);
    const legacyCart = JSON.parse(
      localStorage.getItem('knitted-toy-cart') || '[]'
    );
    return Array.isArray(legacyCart) ? { guest: legacyCart } : {};
  } catch {
    return {};
  }
}

function isCartMap(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userKey = user?.id != null ? String(user.id) : 'guest';
  const [initialCarts] = useState(getInitialCarts);
  const [carts, setCarts] = useLocalStorage(
    STORAGE_KEY,
    initialCarts,
    isCartMap
  );
  const items = useMemo(
    () => (Array.isArray(carts[userKey]) ? carts[userKey] : []),
    [carts, userKey]
  );

  useEffect(() => {
    if (userKey === 'guest') return;
    setCarts((currentCarts) => {
      if (Object.hasOwn(currentCarts, userKey) || !currentCarts.guest?.length) {
        return currentCarts;
      }
      return { ...currentCarts, [userKey]: currentCarts.guest, guest: [] };
    });
  }, [setCarts, userKey]);

  const value = useMemo(
    () => ({
      items,
      total: getCartTotal(items),
      itemCount: getCartItemCount(items),
      addToCart: (product, quantity = 1) =>
        setCarts((currentCarts) => ({
          ...currentCarts,
          [userKey]: addItem(currentCarts[userKey] || [], product, quantity),
        })),
      setQuantity: (id, quantity) =>
        setCarts((currentCarts) => ({
          ...currentCarts,
          [userKey]: updateQuantity(currentCarts[userKey] || [], id, quantity),
        })),
      removeFromCart: (id) =>
        setCarts((currentCarts) => ({
          ...currentCarts,
          [userKey]: (currentCarts[userKey] || []).filter(
            (item) => item.id !== id
          ),
        })),
      clearCart: () =>
        setCarts((currentCarts) => ({ ...currentCarts, [userKey]: [] })),
    }),
    [items, setCarts, userKey]
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
