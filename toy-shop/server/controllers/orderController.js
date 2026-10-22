import { createOrder, getOrdersForUser } from '../models/Order.js';

export function placeOrder(request, response) {
  const order = createOrder({
    ...request.body,
    userId: request.user?.id,
  });
  return response.status(201).json(order);
}

export function listOrders(request, response) {
  return response.json(getOrdersForUser(request.user.id));
}
