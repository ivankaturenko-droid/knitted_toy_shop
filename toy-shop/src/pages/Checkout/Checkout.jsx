import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { useCart } from '../../features/cart/hooks/useCart.js';
import { useAccountData } from '../../features/account/useAccountData.js';
import OrderForm from '../../features/orders/components/OrderForm.jsx';
import OrderSummary from '../../features/orders/components/OrderSummary.jsx';
import decor from '../../styles/brand-decorations.module.css';
import { useFetch } from '../../shared/hooks/useFetch.js';
import { usePost } from '../../shared/hooks/usePost.js';
import styles from './Checkout.module.css';

function CheckoutFrame({ children }) {
  return (
    <div className={`${decor.pageDecor} ${styles.decor}`}>
      <span
        aria-hidden="true"
        className={`${styles.berry} ${styles.berryLeft}`}
      />
      <span
        aria-hidden="true"
        className={`${styles.berry} ${styles.berryRight}`}
      />
      <section className={styles.page}>{children}</section>
    </div>
  );
}

function isValidCartQuantity(quantity) {
  return Number.isSafeInteger(quantity) && quantity > 0;
}

export default function Checkout() {
  const { items: cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { addresses } = useAccountData();
  const [completedOrder, setCompletedOrder] = useState(null);
  const [retryError, setRetryError] = useState(null);
  const { post, loading: isSubmitting } = usePost();
  const {
    data: products,
    loading: isLoadingProducts,
    error: productRequestError,
    refetch: refetchProducts,
  } = useFetch('/products');

  const productsError = productRequestError || retryError;
  const productById = useMemo(
    () =>
      new Map(
        (Array.isArray(products) ? products : []).map((product) => [
          String(product.id),
          product,
        ])
      ),
    [products]
  );

  const orderItems = useMemo(
    () =>
      cartItems.map((cartItem) => {
        const product = productById.get(String(cartItem.id));
        const quantityIsValid = isValidCartQuantity(cartItem.quantity);
        const productIsValid =
          product &&
          typeof product.name === 'string' &&
          typeof product.price === 'number' &&
          Number.isFinite(product.price) &&
          product.price >= 0;
        const lineTotalIsValid =
          productIsValid &&
          quantityIsValid &&
          Number.isFinite(product.price * cartItem.quantity);
        return {
          productId: cartItem.id,
          name: productIsValid ? product.name : cartItem.name || 'Товар',
          price: productIsValid ? product.price : null,
          quantity: cartItem.quantity,
          image: productIsValid ? product.image : cartItem.image,
          available: Boolean(lineTotalIsValid),
          quantityIsValid,
          productExists: Boolean(product),
        };
      }),
    [cartItems, productById]
  );

  const itemError = useMemo(() => {
    if (isLoadingProducts || productsError || cartItems.length === 0) return '';
    if (orderItems.some((item) => !item.quantityIsValid)) {
      return 'У кошику є товар із некоректною кількістю. Виправте її перед оформленням.';
    }
    if (orderItems.some((item) => !item.productExists || !item.available)) {
      return 'Один або кілька товарів більше недоступні або мають некоректні дані.';
    }
    return '';
  }, [cartItems.length, isLoadingProducts, orderItems, productsError]);

  const goodsTotal = useMemo(() => {
    if (
      isLoadingProducts ||
      productsError ||
      itemError ||
      orderItems.length === 0
    ) {
      return null;
    }
    const total = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return Number.isFinite(total) ? total : null;
  }, [isLoadingProducts, itemError, orderItems, productsError]);

  if (!user) return <Navigate to="/login?returnTo=%2Fcheckout" replace />;

  if (completedOrder) {
    return (
      <CheckoutFrame>
        <h1 className="page-heading">Дякуємо за замовлення!</h1>
        <section className={`panel ${styles.successCard}`}>
          <p className={styles.successMessage} role="status">
            Ваше замовлення успішно створено.
          </p>
          <p>
            Номер замовлення: <strong>{completedOrder.id}</strong>
          </p>
          <p>
            До сплати за товари:{' '}
            <strong>{completedOrder.total.toLocaleString('uk-UA')} грн</strong>.
            Вартість доставки сплачується окремо за тарифом служби.
          </p>
          <p>
            Інформацію про подальші кроки можна переглянути в особистому
            кабінеті.
          </p>
          <OrderSummary
            goodsTotal={completedOrder.total}
            items={completedOrder.items}
          />
          <div className={styles.successActions}>
            <Link className="button" to="/account/orders">
              До історії замовлень
            </Link>
            <Link className="button button--secondary" to="/catalog">
              Повернутися до каталогу
            </Link>
          </div>
        </section>
      </CheckoutFrame>
    );
  }

  if (cartItems.length === 0) {
    return (
      <CheckoutFrame>
        <h1 className="page-heading">Оформлення замовлення</h1>
        <p className="notice">Додайте товари до кошика перед оформленням.</p>
        <Link className="button" to="/catalog">
          До каталогу
        </Link>
      </CheckoutFrame>
    );
  }

  async function submitOrder(formData) {
    if (!user || !cartItems.length || goodsTotal === null || itemError) {
      throw new Error('Перевірте дані товарів у кошику перед оформленням.');
    }

    const savedItems = orderItems.map(
      ({ productId, name, price, quantity, image }) => ({
        productId,
        name,
        price,
        quantity,
        image,
      })
    );
    const order = await post('/orders', {
      ...formData,
      userId: user.id,
      total: goodsTotal,
      deliveryCost: null,
      createdAt: new Date().toISOString(),
      status: 'Нове',
      items: savedItems,
    });

    if (order.id === undefined || order.id === null) {
      throw new Error('Сервер не повернув номер створеного замовлення.');
    }

    setCompletedOrder({
      id: order.id,
      items: orderItems,
      total: goodsTotal,
    });
    clearCart();
  }

  function retryProductRequest() {
    setRetryError(null);
    refetchProducts('/products').catch(setRetryError);
  }

  const canSubmit =
    !isLoadingProducts &&
    !productsError &&
    !itemError &&
    goodsTotal !== null &&
    !isSubmitting;
  const submitBlockedMessage = isLoadingProducts
    ? 'Завантажуємо актуальні дані товарів…'
    : productsError
      ? 'Наразі не можна оформити замовлення без перевірки товарів.'
      : goodsTotal === null
        ? 'Не вдалося визначити коректну загальну вартість замовлення.'
        : itemError;

  return (
    <CheckoutFrame>
      <h1 className="page-heading">Оформлення замовлення</h1>
      <div className={styles.checkoutLayout}>
        <OrderForm
          addresses={addresses}
          canSubmit={canSubmit}
          initialValues={user}
          onSubmit={submitOrder}
          submitBlockedMessage={submitBlockedMessage}
        />
        <OrderSummary
          goodsTotal={goodsTotal}
          itemError={itemError}
          items={orderItems}
          onRetry={retryProductRequest}
          productsError={productsError}
          productsLoading={isLoadingProducts}
        />
      </div>
    </CheckoutFrame>
  );
}
