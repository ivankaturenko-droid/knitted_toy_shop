import { Router } from 'express';
import { listOrders, placeOrder } from '../controllers/orderController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', optionalAuth, placeOrder);
router.get('/', requireAuth, listOrders);

export default router;
