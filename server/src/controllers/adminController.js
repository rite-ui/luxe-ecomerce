import asyncHandler from 'express-async-handler';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';


// GET /api/admin/stats
export const getStats = asyncHandler(async (req , res) =>{
    const [totalOrders, totalProducts, totalUsers, revenueAgg] = await Promise.all([
        Order.countDocuments(),
        Product.countDocuments({isActive: true}),
        User.countDocuments({role: 'user'}),
        Order.aggregate([
            {$match: {isPaid: true}},
            {$group: {_id: null, total: {$sum: '$totalPrice'}}},
        ]),
    ]);

    const revenue = revenueAgg[0] ?.total|| 0;

    // Monthly revenue — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [monthlyRevenue , topProducts , recentOrders] = await Promise.all([
        Order.aggregate([
            {$match: {isPaid: true, paidAt: {$gte: sixMonthsAgo}}},
            {$group: {
                _id: {month: {$month: '$createdAt'}, year: {$year: '$createdAt'}},
                revenue: {$sum: '$totalPrice'},
                count: {$sum: 1},
            }},
            {$sort: {'_id.year': 1, '_id.month': 1}},
        ]),
        Product.find({isActive: true}).sort({sold: -1}).limit(5).select('name sold price images'),
        Order.find().populate('user', 'name email').sort({createdAt: -1}).limit(10).select('totalPrice isPaid paidAt createdAt user'),
    ]);

    return res.json({
        success: true,
        data: {
            totalOrders,
            totalProducts,
            totalUsers,
            revenue,
            monthlyRevenue,
            topProducts,
            recentOrders,
        },
    });
});