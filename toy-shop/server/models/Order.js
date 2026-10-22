import { randomUUID } from 'node:crypto';
import orders from '../data/orders.js';
import { getProductById } from './Product.js';

export function createOrder({ customer, items, userId }) {
  if (
    !customer?.name?.trim() ||
    !customer?.email?.trim() ||
    !customer?.address?.trim()
  ) {
    const error = new Error(
      'Вкажіть ім’я, електронну пошту та адресу доставки.'
    );
    error.status = 400;
    throw error;
  }
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('Додайте хоча б один товар до замовлення.');
    error.status = 400;
    throw error;
  }

  const orderItems = items.map(({ productId, quantity }) => {
    const product = getProductById(String(productId));
    if (
      !product ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      const error = new Error(
        'Замовлення містить невідомий товар або некоректну кількість.'
      );
      error.status = 400;
      throw error;
    }
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    };
  });

  const order = {
    id: randomUUID(),
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim().toLowerCase(),
      address: customer.address.trim(),
    },
    items: orderItems,
    total: orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    userId,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

export function getOrdersForUser(userId) {
  return orders.filter((order) => order.userId === userId);
}
