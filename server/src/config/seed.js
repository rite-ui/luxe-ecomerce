import 'dotenv/config';
import { connectDB } from './db.js';
import User from '../models/user.model.js';
import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';

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
    price: 420, category: 'jwellery', brand: 'LUXE Joaillerie',
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
    price: 185, comparePrice: 250, category: 'jwellery', brand: 'LUXE Joaillerie',
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
    price: 750, category: 'jwellery', brand: 'LUXE Joaillerie',
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
  {
    name: 'Santal No. 7 Eau de Parfum',
    description: 'A warm, sophisticated fragrance of sandalwood, cedar, iris, and soft musk in a signature glass flacon.',
    shortDescription: 'Sandalwood, cedar and soft musk eau de parfum.',
    price: 155, comparePrice: 185, category: 'fragrance', brand: 'LUXE Parfums',
    tags: ['fragrance', 'sandalwood', 'woody', 'bestseller'],
    images: [{ url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', alt: 'Santal Eau de Parfum' }],
    stock: 42, rating: 4.8, numReviews: 214, isBestSeller: true, isFeatured: true,
  },
  {
    name: 'Rose Impériale Perfume Oil',
    description: 'Concentrated perfume oil blending Turkish rose, saffron, vanilla, and incense for an elegant long-lasting finish.',
    shortDescription: 'Turkish rose, saffron and vanilla perfume oil.',
    price: 110, category: 'fragrance', brand: 'LUXE Parfums',
    tags: ['fragrance', 'rose', 'perfume-oil', 'gift'],
    images: [{ url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80', alt: 'Rose Imperial Perfume Oil' }],
    stock: 65, rating: 4.7, numReviews: 96, isNew: true,
  },
  {
    name: 'Élan Pearl Pendant Necklace',
    description: 'A luminous freshwater pearl pendant on a delicate 18K gold-plated chain, designed for everyday elegance.',
    shortDescription: 'Freshwater pearl pendant with gold-plated chain.',
    price: 240, comparePrice: 295, category: 'jwellery', brand: 'LUXE Joaillerie',
    tags: ['necklace', 'pearl', 'gold', 'new'],
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80', alt: 'Pearl Pendant Necklace' }],
    stock: 24, rating: 4.8, numReviews: 77, isNew: true, isFeatured: true,
  },
  {
    name: 'Celeste Sapphire Tennis Bracelet',
    description: 'A refined row of brilliant blue sapphire stones set in polished sterling silver for timeless evening style.',
    shortDescription: 'Blue sapphire tennis bracelet in sterling silver.',
    price: 340, category: 'jwellery', brand: 'LUXE Joaillerie',
    tags: ['bracelet', 'sapphire', 'silver', 'evening'],
    images: [{ url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80', alt: 'Sapphire Tennis Bracelet' }],
    stock: 12, rating: 4.9, numReviews: 51, isBestSeller: true,
  },
  {
    name: 'Luna Cashmere Wrap Coat',
    description: 'A softly tailored cashmere-blend wrap coat with a wide collar, tie belt, and luxurious satin lining.',
    shortDescription: 'Tailored cashmere-blend wrap coat.',
    price: 490, comparePrice: 620, category: 'fashion', brand: 'LUXE Maison',
    tags: ['coat', 'cashmere', 'outerwear', 'winter'],
    images: [{ url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80', alt: 'Cashmere Wrap Coat' }],
    variants: [{ name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'] }],
    stock: 18, rating: 4.8, numReviews: 42, isFeatured: true,
  },
  {
    name: 'Marais Tailored Trousers',
    description: 'High-waisted Italian wool trousers with a clean pleat and graceful wide-leg silhouette for polished dressing.',
    shortDescription: 'High-waisted Italian wool wide-leg trousers.',
    price: 210, category: 'fashion', brand: 'LUXE Maison',
    tags: ['trousers', 'wool', 'tailored', 'essentials'],
    images: [{ url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80', alt: 'Tailored Wool Trousers' }],
    variants: [{ name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'] }],
    stock: 35, rating: 4.6, numReviews: 58,
  },
  {
    name: 'Travertine Sculptural Candle',
    description: 'A hand-poured soy wax candle in a natural travertine vessel with notes of fig leaf, cedar, and sandalwood.',
    shortDescription: 'Hand-poured soy candle in a travertine vessel.',
    price: 78, category: 'home', brand: 'LUXE Living',
    tags: ['home', 'candle', 'travertine', 'gift'],
    images: [{ url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80', alt: 'Travertine Sculptural Candle' }],
    stock: 70, rating: 4.8, numReviews: 119, isNew: true, isFeatured: true,
  },
  {
    name: 'Linen & Gold Table Runner',
    description: 'Textured European linen table runner finished with a subtle gold border to elevate intimate dining occasions.',
    shortDescription: 'European linen table runner with gold trim.',
    price: 92, comparePrice: 115, category: 'home', brand: 'LUXE Living',
    tags: ['home', 'linen', 'dining', 'decor'],
    images: [{ url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80', alt: 'Linen Table Runner' }],
    stock: 38, rating: 4.6, numReviews: 64,
  },
  {
    name: 'Aurelia Leather Card Holder',
    description: 'Slim Italian leather card holder with four card slots and a central pocket, finished with a discreet gold logo.',
    shortDescription: 'Slim Italian leather card holder with gold detail.',
    price: 75, category: 'accessories', brand: 'LUXE Maison',
    tags: ['accessories', 'leather', 'card-holder', 'gift'],
    images: [{ url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', alt: 'Leather Card Holder' }],
    variants: [{ name: 'Color', options: ['Black', 'Tan', 'Burgundy'] }],
    stock: 60, rating: 4.7, numReviews: 88, isBestSeller: true,
  },
  {
    name: 'Solstice Silk Hair Scarf',
    description: 'A hand-rolled pure silk scarf printed with an abstract sun motif, perfect for hair, neck, or handbag styling.',
    shortDescription: 'Pure silk sun-motif styling scarf.',
    price: 58, comparePrice: 72, category: 'accessories', brand: 'LUXE Maison',
    tags: ['accessories', 'silk', 'scarf', 'new'],
    images: [{ url: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=800&q=80', alt: 'Silk Hair Scarf' }],
    stock: 85, rating: 4.8, numReviews: 73, isNew: true,
  },
  {
    name: 'Céleste Eye Renewal Cream',
    description: 'A cooling peptide eye cream with caffeine and ceramides to visibly soften the look of fatigue and fine lines.',
    shortDescription: 'Peptide, caffeine and ceramide eye cream.',
    price: 88, category: 'beauty', brand: 'LUXE Skincare',
    tags: ['beauty', 'eye-cream', 'peptides', 'skincare'],
    images: [{ url: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800&q=80', alt: 'Eye Renewal Cream' }],
    stock: 55, rating: 4.7, numReviews: 132, isFeatured: true,
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