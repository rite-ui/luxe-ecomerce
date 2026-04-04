import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Razorpay Instance Initialize karein (Secret Key server par hi rehni chahiye)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// GET /api/payments/config — Razorpay Key ID frontend ke liye
router.get('/config', (req, res) => {
    res.json({ keyId: process.env.RAZORPAY_KEY_ID });
});

// POST /api/payments/order — Razorpay Order Create karein
router.post('/order', protect, asyncHandler(async (req, res) => {
    const { amount } = req.body;

    const options = {
        amount: Math.round(amount * 100), // Paise mein (INR 1 = 100 paise)
        currency: 'INR', // Razorpay 'rs' nahi 'INR' use karta hai
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