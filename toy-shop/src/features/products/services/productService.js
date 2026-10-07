import { apiRequest } from '../../../shared/utils/api.js';

export function getProducts() {
  return apiRequest('/products');
}

export function getProduct(id) {
  return apiRequest(`/products/${encodeURIComponent(id)}`);
}
