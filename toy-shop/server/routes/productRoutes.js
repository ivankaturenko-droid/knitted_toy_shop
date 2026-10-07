import { Router } from 'express';
import { listProducts, showProduct } from '../controllers/productController.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', showProduct);

export default router;
