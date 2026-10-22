import { getAuthHeaders } from '../../auth/services/authService.js';
import { apiRequest } from '../../../shared/utils/api.js';

export function createOrder(order) {
  return apiRequest('/orders', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(order),
  });
}

export function getOrders() {
  return apiRequest('/orders', { headers: getAuthHeaders() });
}
