import { getAllProducts, getProductById } from '../models/Product.js';

export function listProducts(_request, response) {
  response.json(getAllProducts());
}

export function showProduct(request, response) {
  const product = getProductById(request.params.id);
  if (!product) {
    return response.status(404).json({ message: 'Товар не знайдено.' });
  }
  return response.json(product);
}
