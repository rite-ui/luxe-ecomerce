import { Router } from 'express';
import 'dotenv/config';
import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import { protect } from '../middleware/authMiddleware.js';
import { Order } from '../models/order.model.js';

const router = Router();

const hasRazorpayCreds = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_ID !== 'demo_secret' && process.env.RAZORPAY_KEY_SECRET !== 'demo_secret');
const razorpay = hasRazorpayCreds ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

// GET /api/payments/config — Razorpay Key ID frontend ke liye
router.get('/config', (_req, res) => {
    res.json({ success: true, keyId: hasRazorpayCreds ? process.env.RAZORPAY_KEY_ID : null });
});

// POST /api/payments/order — Razorpay Order Create karein
router.post('/order', protect, asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!razorpay) {
        res.status(503);
        throw new Error('Razorpay is not configured. Add valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env');
    }

    const orderRecord = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!orderRecord) {
        res.status(404);
        throw new Error('Order not found');
    }
    if (orderRecord.isPaid || orderRecord.paymentMethod !== 'razorpay') {
        res.status(400);
        throw new Error('This order is not available for Razorpay payment');
    }

    const options = {
        amount: Math.round(orderRecord.totalPrice * 100),
        currency: 'INR',
        receipt: `receipt_${orderRecord._id}`,
        notes: { userId: req.user._id.toString(), orderId: orderRecord._id.toString() }
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
        res.status(500);
        throw new Error('Order creation failed');
    }

    orderRecord.paymentResult = { razorpayOrderId: order.id, status: 'created' };
    await orderRecord.save();

    res.json({ success: true, order });
}));

export default router;