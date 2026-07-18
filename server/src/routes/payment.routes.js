import { Router } from 'express';
import 'dotenv/config';
import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const hasRazorpayCreds = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_ID !== 'demo_secret' && process.env.RAZORPAY_KEY_SECRET !== 'demo_secret');
const razorpay = hasRazorpayCreds ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

// GET /api/payments/config — Razorpay Key ID frontend ke liye
router.get('/config', (_req, res) => {
    res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key' });
});

// POST /api/payments/order — Razorpay Order Create karein
router.post('/order', protect, asyncHandler(async (req, res) => {
    const { amount } = req.body;

    if (!razorpay) {
        return res.json({
            success: true,
            order: {
                id: `mock_${Date.now()}`,
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: `receipt_order_${Date.now()}`,
            },
        });
    }

    const options = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
        notes: { userId: req.user._id.toString() }
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
        res.status(500);
        throw new Error('Order creation failed');
    }

    res.json({ success: true, order });
}));

export default router;