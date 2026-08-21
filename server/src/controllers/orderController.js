import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import {Order}   from '../models/order.model.js';
import {Product} from '../models/product.model.js';

// POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;
  if (!items?.length) { res.status(400); throw new Error('No order items'); }

  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product)                    throw new Error(`Product not found: ${item.product}`);
    if (product.stock < item.quantity) throw new Error(`Insufficient stock: ${product.name}`);

    orderItems.push({
      product:  product._id,
      name:     product.name,
      image:    product.images[0]?.url || '',
      price:    product.price,
      quantity: item.quantity,
      variant:  item.variant || '',
    });
    itemsPrice     += product.price * item.quantity;
    product.stock  -= item.quantity;
    product.sold   += item.quantity;
    await product.save();
  }

  const shippingPrice = itemsPrice >= 200 ? 0 : 15;
  const taxPrice      = +(itemsPrice * 0.08).toFixed(2);
  const totalPrice    = +(itemsPrice + shippingPrice + taxPrice).toFixed(2);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shipping: shippingAddress,
    paymentMethod,
    notes,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    statusHistory: [{ status: 'pending', note: 'Order placed successfully' }],
  });

  res.status(201).json({ success: true, data: order });
});

// GET /api/orders/my
export const getMyOrders = asyncHandler(async (req, res) => {
  const page  = +req.query.page  || 1;
  const limit = +req.query.limit || 10;
  const skip  = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({ success: true, total, pages: Math.ceil(total / limit), page, data: orders });
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorised');
  }
  res.json({ success: true, data: order });
});

// PUT /api/orders/:id/pay
export const payOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorised');
  }
  if (order.isPaid) { res.status(400); throw new Error('Order is already paid'); }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400); throw new Error('Incomplete Razorpay payment response');
  }
  if (order.paymentResult?.razorpayOrderId !== razorpay_order_id) {
    res.status(400); throw new Error('Razorpay order does not match this order');
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  const signaturesMatch = expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));
  if (!signaturesMatch) {
    res.status(400); throw new Error('Invalid Razorpay payment signature');
  }

  order.isPaid         = true;
  order.paidAt         = Date.now();
  order.status         = 'processing';
  order.paymentResult  = {
    ...(order.paymentResult?.toObject?.() || {}),
    id: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
    signature: razorpay_signature,
    status: 'success',
    updateAt: new Date().toISOString(),
    email: req.body.email,
  };
  order.statusHistory.push({ status: 'processing', note: 'Payment confirmed' });

  await order.save();
  res.json({ success: true, data: order });
});

// PUT /api/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorised');
  }
  if (['shipped', 'delivered'].includes(order.status)) {
    res.status(400); throw new Error('Cannot cancel a shipped order');
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity },
    });
  }

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by customer' });
  await order.save();
  res.json({ success: true, data: order });
});

// GET /api/admin/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const page   = +req.query.page  || 1;
  const limit  = +req.query.limit || 20;
  const skip   = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, total, pages: Math.ceil(total / limit), page, data: orders });
});

// PUT /api/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.status = status;
  order.statusHistory.push({ status, note: note || '' });
  if (trackingNumber)       order.trackingNumber = trackingNumber;
  if (status === 'delivered') { order.isDelivered = true; order.deliveredAt = Date.now(); }

  await order.save();
  res.json({ success: true, data: order });
});
