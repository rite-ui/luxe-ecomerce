// Seed Script: Run with `node seed.js` from the server directory
// This creates 12 luxury demo products across all categories

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Product } from './src/models/product.model.js';

dotenv.config();

const products = [
  {
    name: "Silk Draped Evening Gown",
    category: "fashion",
    brand: "Maison Luxe",
    price: 24999,
    comparePrice: 32000,
    description: "An iconic silk draped evening gown crafted from the finest 22-momme mulberry silk. Hand-finished with artisanal French seam techniques and tailored to create a perfectly elongated silhouette. The structured bodice features internal boning for supreme support without compromise.",
    shortDescription: "22-momme mulberry silk evening gown with artisanal French seam detailing.",
    stock: 8,
    isFeatured: true,
    isNew: true,
    images: [{ url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop", alt: "Silk Evening Gown" }],
    variants: [{ name: "Size", options: ["XS", "S", "M", "L", "XL"] }],
  },
  {
    name: "Cashmere Tailored Blazer",
    category: "fashion",
    brand: "Maison Luxe",
    price: 18500,
    comparePrice: 22000,
    description: "A perfectly crafted cashmere blazer with a double-vent back and structured shoulder pads sourced from Mongolian highland cashmere. Each blazer takes 14 hours of handwork by specialist tailors in our Milan atelier.",
    shortDescription: "Mongolian highland cashmere tailored blazer, Milan-made.",
    stock: 12,
    isFeatured: true,
    images: [{ url: "https://images.unsplash.com/photo-1594938298603-c8148c4b1ddb?q=80&w=800&auto=format&fit=crop", alt: "Cashmere Blazer" }],
    variants: [{ name: "Size", options: ["S", "M", "L", "XL"] }],
  },
  {
    name: "L'Essence de Rose Parfum",
    category: "fragrance",
    brand: "Maison Luxe",
    price: 8999,
    comparePrice: 11000,
    description: "A rare composition of Bulgarian rose absolute, oud from Assam, and white amber aged in Moroccan vessels. The eau de parfum concentration ensures all-day saturation of this complex floral oriental profile. Presented in a hand-blown Venetian glass flacon.",
    shortDescription: "Bulgarian rose absolute and rare Assam oud in hand-blown Venetian glass.",
    stock: 25,
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    images: [{ url: "https://images.unsplash.com/photo-1583467875263-d50dec37a88c?q=80&w=800&auto=format&fit=crop", alt: "Rose Parfum" }],
    variants: [{ name: "Volume", options: ["30ml", "50ml", "100ml"] }],
  },
  {
    name: "Noir Oud Extrait",
    category: "fragrance",
    brand: "Maison Luxe",
    price: 12500,
    description: "An intense extrait de parfum built on the rarest grade of Cambodian oud, complemented by leather accord, black iris and Italian bergamot. 40% concentration ensures extraordinary projection and a 24-hour trail.",
    shortDescription: "Cambodian oud extrait with leather, black iris, and bergamot.",
    stock: 18,
    isFeatured: true,
    images: [{ url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop", alt: "Noir Oud" }],
    variants: [{ name: "Volume", options: ["50ml", "100ml"] }],
  },
  {
    name: "18K Gold Diamond Tennis Bracelet",
    category: "jwellery",
    brand: "Maison Luxe",
    price: 89000,
    comparePrice: 105000,
    description: "A classic tennis bracelet set in 18-karat solid yellow gold, featuring 3.2 carats of conflict-free round brilliant diamonds with VS1 clarity and G color grade. The secure box clasp with double safety lock ensures it remains in place during all occasions.",
    shortDescription: "3.2ct VS1 conflict-free diamonds in 18K solid yellow gold with safety clasp.",
    stock: 3,
    isFeatured: true,
    isBestseller: true,
    images: [{ url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop", alt: "Diamond Tennis Bracelet" }],
  },
  {
    name: "Pearl Drop Statement Earrings",
    category: "jwellery",
    brand: "Maison Luxe",
    price: 15800,
    description: "Baroque South Sea pearls suspended on 18-karat white gold with pavé diamond-set hooks. Each pearl is hand-selected for its lustre and symmetry, with natural overtones that shift from silver to rose depending on the light.",
    shortDescription: "Baroque South Sea pearl drops on 18K white gold with diamond pavé hooks.",
    stock: 10,
    isNew: true,
    images: [{ url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop", alt: "Pearl Earrings" }],
  },
  {
    name: "Lumineux Vitamin C Serum",
    category: "beauty",
    brand: "Maison Luxe",
    price: 4999,
    comparePrice: 6500,
    description: "A revolutionary 22% stabilized vitamin C serum combined with hyaluronic acid spheres and ferulic acid. Clinical trials showed 84% improvement in skin radiance within 4 weeks. The airless pump maintains full potency throughout the bottle life.",
    shortDescription: "22% stabilized Vitamin C + hyaluronic acid serum. Clinically tested.",
    stock: 50,
    isFeatured: true,
    isBestseller: true,
    images: [{ url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop", alt: "Vitamin C Serum" }],
    variants: [{ name: "Size", options: ["30ml", "50ml"] }],
  },
  {
    name: "Golden Hour Face Oil",
    category: "beauty",
    brand: "Maison Luxe",
    price: 3800,
    description: "A luxurious face oil combining 24k gold microparticles with rosehip seed oil, jojoba, and sea buckthorn to firm, hydrate, and restore luminosity. Dermatologist-tested and suitable for all skin types, including sensitive.",
    shortDescription: "24K gold microparticle face oil with rosehip and sea buckthorn.",
    stock: 35,
    isNew: true,
    images: [{ url: "https://images.unsplash.com/photo-1570194065650-d99fb4b5e9c5?q=80&w=800&auto=format&fit=crop", alt: "Face Oil" }],
  },
  {
    name: "Silk Charmeuse Sleeping Mask",
    category: "beauty",
    brand: "Maison Luxe",
    price: 2200,
    description: "A 100% mulberry silk sleeping eye mask with an adjustable satin-ribbon strap. The 22-momme weight provides total light blockage while the cooling silk naturally regulates temperature for deeper REM cycles.",
    shortDescription: "22-momme mulberry silk sleep mask with cooling properties.",
    stock: 45,
    images: [{ url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop", alt: "Silk Sleeping Mask" }],
  },
  {
    name: "Italian Marble Serving Board",
    category: "home",
    brand: "Maison Luxe",
    price: 9800,
    description: "Carved from a single block of Carrara white marble with natural grey veining, this serving board features two carved handles and a food-safe sealant. Each piece is unique; veining patterns vary. A statement piece for both functional and aesthetic entertaining.",
    shortDescription: "Single-block Carrara marble serving board with natural grey veining.",
    stock: 6,
    isFeatured: true,
    images: [{ url: "https://images.unsplash.com/photo-1592499181028-d648b88f5e77?q=80&w=800&auto=format&fit=crop", alt: "Marble Serving Board" }],
  },
  {
    name: "Python-Embossed Leather Belt",
    category: "accessories",
    brand: "Maison Luxe",
    price: 5200,
    comparePrice: 6800,
    description: "A hand-finished belt in full-grain Italian calfskin with a python-emboss texture. The 24k gold-plated brass buckle features the Maison Luxe monogram engraving. Available in two widths for both everyday and formal wear.",
    shortDescription: "Full-grain Italian calfskin python-emboss with gold-plated monogram buckle.",
    stock: 20,
    isBestseller: true,
    images: [{ url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop", alt: "Leather Belt" }],
    variants: [{ name: "Size", options: ["S (70-80cm)", "M (80-90cm)", "L (90-100cm)", "XL (100-110cm)"] }],
  },
  {
    name: "Monogram Canvas Tote Bag",
    category: "accessories",
    brand: "Maison Luxe",
    price: 16900,
    description: "A structured tote in our signature coated canvas with vachetta leather handles that develop a natural patina over time. Internal organisation includes a zip pocket, two slip pockets, and a key holder. Reinforced base studs protect the base.",
    shortDescription: "Signature coated canvas tote with vachetta leather handles and internal organiser.",
    stock: 14,
    isNew: true,
    images: [{ url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop", alt: "Canvas Tote" }],
    variants: [{ name: "Color", options: ["Classic Monogram", "Navy Monogram", "Brown Check"] }],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing products
    await Product.deleteMany({});
    console.log('🧹 Cleared existing products');

    // Insert seed products
    const created = await Product.insertMany(products);
    console.log(`🌟 Successfully seeded ${created.length} luxury products`);
    
    console.log('\n📦 Products seeded:');
    created.forEach((p) => console.log(`  - [${p.category.toUpperCase()}] ${p.name} — ₹${p.price.toLocaleString()}`));

    console.log('\n✨ Database is ready. Launch the server and start the client!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

seedDatabase();
