import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB } from './config/db.js'; 
import User from '../models/user.model.js';         
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';

// --- SEED DATA ---
const users = [
  { 
    name: 'Admin User', 
    email: 'admin@luxe.com', 
    password: 'admin123456', 
    role: 'admin', 
    emailVerified: true 
  },
  { 
    name: 'Jane Doe', 
    email: 'jane@example.com', 
    password: 'user123456', 
    role: 'user', 
    emailVerified: true 
  },
];

const products = [
  {
    name: 'Midnight Elixir Perfume',
    description: 'A captivating blend of dark oud, black rose, and amber. Handcrafted in small batches.',
    shortDescription: 'Dark oud, black rose & amber signature blend.',
    price: 185, comparePrice: 220, category: 'fragrance', brand: 'LUXE Parfums',
    tags: ['fragrance', 'oud', 'luxury', 'new'],
    images: [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80', alt: 'Midnight Elixir Perfume' }],
    stock: 50, rating: 4.9, numReviews: 342, isFeatured: true, isNew: true,
  },
  {
    name: 'Soleil 18K Gold Bracelet',
    description: 'Handcrafted 18-karat gold bracelet featuring sun-inspired motifs. Polished to a mirror finish.',
    shortDescription: '18K gold sun-motif handcrafted bracelet.',
    price: 420, category: 'jewellery', brand: 'LUXE Joaillerie',
    tags: ['gold', 'bracelet', 'handcrafted', 'bestseller'],
    images: [{ url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', alt: 'Gold Bracelet' }],
    stock: 15, rating: 4.8, numReviews: 198, isFeatured: true, isBestSeller: true,
  },
  {
    name: 'Obsidian Regenerative Serum',
    description: 'Clinical-grade retinol serum infused with activated charcoal and hyaluronic acid.',
    shortDescription: 'Clinical retinol + activated charcoal serum.',
    price: 95, comparePrice: 140, category: 'beauty', brand: 'LUXE Skincare',
    tags: ['serum', 'retinol', 'anti-aging', 'sale'],
    images: [{ url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80', alt: 'Obsidian Serum' }],
    stock: 80, rating: 4.7, numReviews: 521, isFeatured: true,
  },
  {
    name: 'Velvet Mist Body Lotion',
    description: 'Ultra-rich body lotion with shea butter, vitamin E and rose extract. 200ml.',
    shortDescription: 'Shea butter & rose extract body lotion.',
    price: 65, category: 'beauty', brand: 'LUXE Body',
    tags: ['body', 'lotion', 'hydrating', 'new'],
    images: [{ url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80', alt: 'Velvet Mist' }],
    stock: 120, rating: 5.0, numReviews: 89, isFeatured: true, isNew: true,
  },
  {
    name: 'Noir Italian Leather Clutch',
    description: 'Full-grain Italian leather clutch with 24K gold-tone hardware. Limited edition.',
    shortDescription: 'Italian leather clutch, Florence artisans. Limited.',
    price: 580, category: 'fashion', brand: 'LUXE Maison',
    tags: ['leather', 'clutch', 'italian', 'limited'],
    images: [{ url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', alt: 'Noir Clutch' }],
    stock: 8, rating: 4.9, numReviews: 67, isFeatured: true, isBestSeller: true,
  },
  {
    name: 'Crystal Drop Earrings',
    description: 'Swarovski crystal drop earrings set in sterling silver with 18K gold plating.',
    shortDescription: 'Swarovski crystal & 18K gold plated sterling silver.',
    price: 185, comparePrice: 250, category: 'jewellery', brand: 'LUXE Joaillerie',
    tags: ['earrings', 'crystal', 'swarovski', 'sale'],
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', alt: 'Crystal Earrings' }],
    stock: 30, rating: 4.6, numReviews: 143, isFeatured: true,
  },
  {
    name: 'Lumière Brightening Toner',
    description: 'Vitamin C & niacinamide toner for luminous, even-toned skin. 150ml glass bottle.',
    shortDescription: 'Vitamin C & niacinamide brightening toner.',
    price: 68, category: 'beauty', brand: 'LUXE Skincare',
    tags: ['toner', 'vitamin-c', 'brightening', 'new'],
    images: [{ url: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800&q=80', alt: 'Lumière Toner' }],
    stock: 95, rating: 4.8, numReviews: 405, isNew: true, isFeatured: true,
  },
  {
    name: 'Aurora Silk Slip Dress',
    description: 'Pure 22-momme silk slip dress with adjustable straps and delicate lace trim.',
    shortDescription: '22-momme pure silk slip dress with lace trim.',
    price: 390, category: 'fashion', brand: 'LUXE Maison',
    tags: ['silk', 'dress', 'luxury', 'new'],
    images: [{ url: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b4b4?w=800&q=80', alt: 'Aurora Dress' }],
    stock: 20, rating: 4.9, numReviews: 34, isNew: true, isFeatured: true,
  },
  {
    name: 'Soleil 22K Gold Statement Cuff',
    description: 'Bold statement cuff in hammered 22-karat gold. Ancient Egyptian inspired.',
    shortDescription: '22K hammered gold heirloom statement cuff.',
    price: 750, category: 'jewellery', brand: 'LUXE Joaillerie',
    tags: ['gold', 'cuff', 'statement', 'limited'],
    images: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', alt: 'Gold Cuff' }],
    stock: 5, rating: 5.0, numReviews: 62, isBestSeller: true, isFeatured: true,
  },
  {
    name: 'Onyx Home Diffuser Set',
    description: 'Artisan ceramic diffuser with 100ml reed diffuser oil in three signature scents.',
    shortDescription: 'Ceramic diffuser + signature oil — 3 scents.',
    price: 120, category: 'home', brand: 'LUXE Maison',
    tags: ['home', 'diffuser', 'fragrance', 'gift'],
    images: [{ url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80', alt: 'Diffuser Set' }],
    stock: 45, rating: 4.7, numReviews: 188, isFeatured: true,
  },
];

// --- SEED FUNCTION ---
const seed = async () => {
  try {
    // 1. Database Connect (db.js wala function)
    await connectDB();

    // 2. Clear existing collections
    await Promise.all([
        User.deleteMany(), 
        Product.deleteMany(), 
        Order.deleteMany()
    ]);
    console.log('🗑️  Existing data cleared');

    // 3. Create fresh data
    const createdUsers = await User.create(users);
    const createdProducts = await Product.create(products);

    console.log(`👤  ${createdUsers.length} users created successfully`);
    console.log(`📦  ${createdProducts.length} products created successfully`);
    
    console.log('\n✨  Seed Process Completed!');
    console.log('─────────────────────────────');
    console.log('📧  Admin : admin@luxe.com / admin123456');
    console.log('📧  User  : jane@example.com / user123456');
    console.log('─────────────────────────────');

    process.exit(0); // Success exit
  } catch (err) {
    console.error('❌  Seed Error:', err.message);
    process.exit(1); // Error exit
  }
};

// Start the script
seed();