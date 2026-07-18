import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { user, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isWishlisted = user?.wishlist?.includes(product._id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      await toggleWishlist(product._id);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const fallbackImage = product.category === 'fragrance'
    ? '/images/fragrance-placeholder.svg'
    : product.category === 'fashion'
      ? '/images/fashion-placeholder.svg'
      : 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop';
  const mainImage = product.images?.[0]?.url || fallbackImage;
  const displayPrice = product.price || 0;
  const originalPrice = product.comparePrice || 0;
  const ratingVal = product.rating || 0;

  return (
    <div className="group relative flex flex-col w-full bg-[var(--bg-primary)] overflow-hidden transition-all duration-300">
      {/* Product Image Outer Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        {/* Product Image */}
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={mainImage}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImage;
            }}
            className="h-full w-full object-cover object-center scale-100 group-hover:scale-[1.04] transition-all duration-500"
            loading="lazy"
          />
        </Link>

        {/* Promo Tags */}
        <div className="absolute left-3 top-3 flex flex-col space-y-1.5 z-10">
          {product.isNew && (
            <span className="bg-[var(--text-primary)] text-[var(--bg-primary)] text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5">
              New
            </span>
          )}
          {(product.isBestSeller || product.isBestseller) && (
            <span className="bg-[#D4AF37] text-black text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5">
              Bestseller
            </span>
          )}
          {originalPrice > displayPrice && (
            <span className="bg-red-500 text-white text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist Icon */}
        <button
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-primary)]/80 text-[var(--text-primary)] shadow-md hover:bg-[var(--bg-primary)] hover:text-red-500 transition-all duration-200"
          aria-label="Wishlist toggle"
        >
          <Heart
            size={16}
            className={`${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[var(--text-primary)]'} transition-colors`}
          />
        </button>

        {/* Quick Hover Control Panel */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 bg-[var(--bg-primary)]/90 backdrop-blur-sm border-t border-[var(--border-color)] px-4 py-3 flex items-center justify-between transition-all duration-300">
          <Link
            to={`/product/${product.slug || product._id}`}
            className="flex items-center text-[10px] uppercase font-medium tracking-wider text-[var(--text-primary)] hover:text-[var(--color-gold-500)] transition-colors"
          >
            <Eye size={12} className="mr-1.5" /> Details
          </Link>
          <button
            onClick={handleQuickAdd}
            className="flex items-center text-[10px] uppercase font-medium tracking-wider text-[var(--text-primary)] hover:text-[var(--color-gold-500)] transition-colors"
          >
            <ShoppingBag size={12} className="mr-1.5" /> Add to Cart
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col py-4 text-left">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-light">
            {product.category}
          </span>
          <div className="flex items-center space-x-0.5 text-[#D4AF37]">
            <Star size={10} className="fill-[#D4AF37]" />
            <span className="text-[10px] font-semibold text-[var(--text-primary)]">
              {ratingVal.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <Link
          to={`/product/${product.slug || product._id}`}
          className="text-sm font-serif font-medium tracking-wide text-[var(--text-primary)] hover:opacity-75 line-clamp-1 mb-2"
        >
          {product.name}
        </Link>

        {/* Prices */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-semibold text-[var(--text-primary)]">
            ₹{displayPrice.toLocaleString()}
          </span>
          {originalPrice > displayPrice && (
            <span className="text-xs text-[var(--text-tertiary)] line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
