import { Router } from "express";
import { getStats } from "../controllers/adminController.js";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { protect,authorize } from "../middleware/authMiddleware.js";

const router = Router();
const adminMiddleware = [protect, authorize('admin')];

router.get( '/stats', ...adminMiddleware, getStats);
router.get( '/orders', ...adminMiddleware, getAllOrders);
router.put( '/orders/:id/status', ...adminMiddleware, updateOrderStatus);

export default router;