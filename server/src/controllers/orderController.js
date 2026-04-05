import asyncHandler from 'express-async-handler';
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
    shippingAddress,
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

  order.isPaid         = true;
  order.paidAt         = Date.now();
  order.status         = 'processing';
  order.paymentResult  = req.body;
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
