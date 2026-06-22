import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Award, ShieldCheck, HelpCircle } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
    title: 'The Autumn Couture',
    subtitle: 'EXPERIENCE PURE ELEGANCE',
    description: 'Explore curated designer silhouettes structured with finest silk and organic blends.',
    link: '/shop?category=fashion',
  },
  {
    image: 'https://images.unsplash.com/photo-1583467875263-d50dec37a88c?q=80&w=1600&auto=format&fit=crop',
    title: 'Signature Fragrances',
    subtitle: 'ESSENCE OF REFINEMENT',
    description: 'Scents designed to capture moments, curated in the fields of Grasse.',
    link: '/shop?category=fragrance',
  },
  {
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop',
    title: 'Fine Jewellery',
    subtitle: 'TIMELESS BRILLIANCE',
    description: 'Handcrafted items detailed with 18k solid gold and premium conflict-free diamonds.',
    link: '/shop?category=jwellery',
  },
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-play hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch featured products
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/products/featured');
        if (response.data.success) {
          setFeaturedProducts(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. Hero Carousel */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-black">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Image Overlay wrapper */}
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover object-center scale-100 transition-transform duration-[6000ms]"
            />
            {/* Hero Text */}
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
              <div className="max-w-3xl space-y-6">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37] block">
                  {slide.subtitle}
                </span>
                <h1 className="font-serif text-4xl sm:text-7xl font-light text-white tracking-wide leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm text-gray-200 font-light max-w-xl mx-auto tracking-wide hidden sm:block">
                  {slide.description}
                </p>
                <div className="pt-4">
                  <Link
                    to={slide.link}
                    className="inline-block border border-white text-white hover:bg-white hover:text-black font-semibold text-xs tracking-[0.2em] uppercase px-8 py-3.5 transition-all duration-300"
                  >
                    View Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Buttons */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 hover:border-white transition-all focus:outline-none"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 hover:border-white transition-all focus:outline-none"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                idx === currentSlide ? 'bg-[#D4AF37] w-6' : 'bg-white/40'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Quick Categories Circle Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-serif tracking-wide">Shop by Maison</h2>
          <div className="h-0.5 w-12 bg-[#D4AF37] mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-4">
          {[
            { name: 'Fashion', slug: 'fashion', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=300' },
            { name: 'Fragrance', slug: 'fragrance', img: 'https://images.unsplash.com/photo-1583467875263-d50dec37a88c?q=80&w=300' },
            { name: 'Jewellery', slug: 'jwellery', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=300' },
            { name: 'Beauty', slug: 'beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=300' },
            { name: 'Accessories', slug: 'accessories', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=300' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center group space-y-3"
            >
              <div className="h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center transition-all duration-300 group-hover:border-[#D4AF37] group-hover:shadow-md">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="h-full w-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                />
              </div>
              <span className="text-xs uppercase tracking-widest font-medium group-hover:text-[var(--color-gold-500)] transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Featured Collection Showcase */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-end justify-between border-b border-[var(--border-color)] pb-4">
          <div className="text-left space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center">
              <Sparkles size={12} className="mr-1.5 fill-[#D4AF37]" /> Seasonal Curations
            </span>
            <h2 className="text-2xl font-serif tracking-wide">Featured Additions</h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center text-xs uppercase tracking-widest font-semibold hover:text-[var(--color-gold-500)] transition-colors"
          >
            Explore All <ArrowRight size={14} className="ml-1.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[3/4] w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
                <div className="h-3 w-1/3 bg-[var(--bg-secondary)]" />
                <div className="h-4 w-3/4 bg-[var(--bg-secondary)]" />
                <div className="h-3 w-1/4 bg-[var(--bg-secondary)]" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[var(--border-color)] space-y-2">
            <p className="text-sm text-[var(--text-tertiary)] italic">The collection is currently resting.</p>
            <p className="text-xs font-light text-[var(--text-tertiary)]">New items are being cataloged by our curatorial team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </div>

      {/* 4. Luxury Brand Story Banner */}
      <div className="w-full bg-[var(--bg-secondary)] border-y border-[var(--border-color)] py-20 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#D4AF37]">
            MAISON DE LUXE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-wide leading-snug">
            "Design is not just what it looks like; it is an experience of comfort, substance, and heritage."
          </h2>
          <div className="h-0.5 w-12 bg-[#D4AF37] mx-auto" />
          <p className="text-xs sm:text-sm font-light leading-relaxed max-w-2xl mx-auto text-[var(--text-secondary)]">
            Our materials are selected with microscopic care, collaborating exclusively with generational workshops in Milan, Grasse, and Tokyo. We design products for life, respecting materials, craftsmen, and the slowing of time.
          </p>
        </div>
      </div>

      {/* 5. Trust Badges */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8">
        <div className="flex flex-col items-center space-y-3 p-6 border border-[var(--border-color)]">
          <Award size={32} className="text-[#D4AF37] stroke-[1.2]" />
          <h4 className="text-xs uppercase tracking-widest font-semibold">Generational Quality</h4>
          <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed font-light">
            Each item is backed by a 5-year quality guarantee and certificate of authenticity.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-3 p-6 border border-[var(--border-color)]">
          <ShieldCheck size={32} className="text-[#D4AF37] stroke-[1.2]" />
          <h4 className="text-xs uppercase tracking-widest font-semibold">Complimentary Logistics</h4>
          <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed font-light">
            Enjoy complimentary express shipping and white-glove packaging on orders over ₹200.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-3 p-6 border border-[var(--border-color)]">
          <HelpCircle size={32} className="text-[#D4AF37] stroke-[1.2]" />
          <h4 className="text-xs uppercase tracking-widest font-semibold">Private Client Support</h4>
          <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed font-light">
            Our concierge team is available 24/7 via private live chat or concierge phone lines.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Home;
