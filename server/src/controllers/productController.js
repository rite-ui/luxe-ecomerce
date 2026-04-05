import asyncHandler from 'express-async-handler';
import {Product} from '../models/product.model.js';

// ─── Build filter from query params ───────────────────────────────────
const buildFilter = (query) => {
    const filter = {isActive: true}; // Only fetch active products

    if (query.category) filter.category = query.category;
    if (query.brand) filter.brand = query.brand;
    if (query.isFeatured) filter.isFeatured = true;
    if (query.isNew) filter.isNew = true;
    if (query.isBestSeller) filter.isBestSeller = true;
    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = +query.minPrice;
        if (query.maxPrice) filter.price.$lte = +query.maxPrice;
    }
    if (query.rating) filter.rating = { $gte: +query.rating };
    if (query.search) filter.$text = { $search: query.search };

    return filter;
};

const SORT_MAP ={
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating : { rating: -1 },
    popular: { sold: -1 },
};

// GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 12;
    const skip = (page - 1) * limit;
    const sort = SORT_MAP[req.query.sort] || { createdAt: -1 };
    const filter = buildFilter(req.query);

    const [products, total] = await Promise.all([
        Product.find(filter).sort(sort).skip(skip).limit(limit).select('-reviews'),
        Product.countDocuments(filter),
    ]);

    return res.json({
        success: true,
        count: products.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: products,
    });
});

// GET /api/products/featured
export const getFeatured = asyncHandler(async (_req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .limit(8)
    .select('name price comparePrice images rating numReviews category isNew isBestSeller slug');
  res.json({ success: true, data: products });
});

// GET /api/products/search?q=...
export const searchProducts = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const products = await Product.find(
        { $text: { $search: q }, isActive: true },
        { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(10)
    .select('name price comparePrice images rating numReviews category isNew isBestSeller slug');

    return res.json({ success: true, data: products });
});

// GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findOne({
        $or: [
            ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : []),
            { slug: req.params.id },
        ],
        isActive: true,
    }).populate('reviews.user', 'name avatar');

    if (!product) { res.status(404); throw new Error('Product not found'); }

    const related = await Product.find({
        category: product.category,
        _id:      { $ne: product._id },
        isActive: true,
    }).limit(4).select('name price images rating numReviews slug');
    
    res.json({ success: true, data: product, related });
});

// POST /api/products  (admin)
export const createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
});

// PUT /api/products/:id  (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, data: product });
});

// DELETE /api/products/:id  (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// POST /api/products/:id/reviews  (user)
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  if (product.reviews.some(r => r.user.toString() === req.user._id.toString())) {
    res.status(400); throw new Error('Already reviewed');
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: +rating, comment });
  product.updateRating();
  await product.save();
  res.status(201).json({ success: true, rating: product.rating, numReviews: product.numReviews });
});