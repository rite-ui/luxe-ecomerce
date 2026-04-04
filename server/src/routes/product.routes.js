import { Router } from 'express';
import {
    getProducts, getFeatured, searchProducts, getProductById,
    createProduct, updateProduct, deleteProduct, addReview,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Admin routes

router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/reviews', protect, authorize('user'), addReview);

export default router;