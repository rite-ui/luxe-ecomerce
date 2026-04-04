import { Router } from 'express';
import {
    createOrder, getMyOrders, getOrder, payOrder, cancelOrder 
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();


router.post('/',    protect, createOrder);
router.get('/my',   protect, getMyOrders);
router.get('/:id',  protect, getOrder);
router.put('/:id/pay', protect, payOrder);
router.put('/:id/cancel', protect, cancelOrder);

export default router;