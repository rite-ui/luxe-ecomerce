import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/product.model.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// DELETE /api/reviews/:productId/:reviewId  (admin)
router.delete('/:productId/:reviewId', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const review = product.reviews.find(r => r._id.toString() === req.params.reviewId);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.reviewId);
  await product.save();
  res.json({ success: true, message: 'Review deleted' });
}));

export default router;