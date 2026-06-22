import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import ReviewSystem from '../components/ReviewSystem';
import { Heart, Star, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronRight, Plus, Minus } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, toggleWishlist } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.data);
        setRelated(response.data.related || []);
        
        // Auto-select first variant option if available
        if (response.data.data.variants?.[0]?.options?.[0]) {
          setSelectedVariant(response.data.data.variants[0].options[0]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Product loading failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // Scroll to top on load/change
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-pulse space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
            <div className="space-y-6 py-6 text-left">
              <div className="h-6 w-1/4 bg-[var(--bg-secondary)]" />
              <div className="h-10 w-3/4 bg-[var(--bg-secondary)]" />
              <div className="h-6 w-1/3 bg-[var(--bg-secondary)]" />
              <div className="h-24 w-full bg-[var(--bg-secondary)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-serif">Product Not Found</h2>
        <p className="text-xs text-[var(--text-tertiary)]">{error || 'Creations details are unavailable.'}</p>
        <Link to="/shop" className="inline-block btn-luxe-primary text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = user?.wishlist?.includes(product._id);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(product._id);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, qty, selectedVariant);
  };

  const imagesList = product.images?.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop', alt: product.name }];

  const currentPrice = product.price || 0;
  const originalPrice = product.comparePrice || 0;
  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-20">
      
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] text-left">
        <Link to="/" className="hover:text-[var(--text-primary)]">Home</Link>
        <ChevronRight size={10} />
        <Link to="/shop" className="hover:text-[var(--text-primary)]">Shop</Link>
        <ChevronRight size={10} />
        <Link to={`/shop?category=${product.category}`} className="hover:text-[var(--text-primary)]">{product.category}</Link>
        <ChevronRight size={10} />
        <span className="text-[var(--text-primary)] font-medium max-w-[150px] truncate">{product.name}</span>
      </div>

      {/* Main product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-[3/4] w-full overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <img
              src={imagesList[selectedImage]?.url}
              alt={imagesList[selectedImage]?.alt || product.name}
              className="h-full w-full object-cover object-center transition-all duration-300"
            />
          </div>
          {imagesList.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-20 w-16 overflow-hidden bg-[var(--bg-secondary)] border shrink-0 transition-all ${
                    selectedImage === idx ? 'border-[var(--text-primary)]' : 'border-[var(--border-color)] hover:border-[var(--text-primary)]'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details info panel */}
        <div className="text-left space-y-6 py-2">
          {/* Brand & Stock */}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
              {product.brand || 'LUXE MAISON'}
            </span>
            <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 ${
              inStock ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          {/* Name */}
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-wide text-[var(--text-primary)]">
            {product.name}
          </h1>

          {/* Review Stats summary */}
          <div className="flex items-center space-x-4 border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center text-[#D4AF37] space-x-1">
              <Star size={14} className="fill-[#D4AF37]" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {product.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">|</span>
            <span className="text-xs text-[var(--text-tertiary)] font-light">
              {product.numReviews} Client reviews
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3">
            <span className="text-2xl font-semibold text-[var(--text-primary)]">
              ₹{currentPrice.toLocaleString()}
            </span>
            {originalPrice > currentPrice && (
              <span className="text-sm text-[var(--text-tertiary)] line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
              {product.shortDescription}
            </p>
          )}

          {/* Variants Selectors */}
          {product.variants?.map((v) => (
            <div key={v.name} className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold">
                Select {v.name}
              </span>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVariant(opt)}
                    className={`px-3 py-1.5 text-xs border transition-all ${
                      selectedVariant === opt
                        ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                        : 'border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity selector & buttons */}
          <div className="flex items-stretch space-x-4 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center border border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-[var(--text-primary)] hover:text-[var(--color-gold-500)]"
              >
                <Minus size={12} />
              </button>
              <span className="px-3 text-sm font-semibold w-10 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                className="px-3 py-2 text-[var(--text-primary)] hover:text-[var(--color-gold-500)]"
              >
                <Plus size={12} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 btn-luxe-primary text-xs uppercase flex items-center justify-center space-x-2 disabled:bg-[var(--border-color)] disabled:cursor-not-allowed"
            >
              <ShoppingBag size={14} />
              <span>{inStock ? 'Add to Shopping Bag' : 'Out of Stock'}</span>
            </button>

            <button
              onClick={handleWishlistToggle}
              className="px-3.5 border border-[var(--border-color)] hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center"
              title="Add to Wishlist"
            >
              <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500 border-none' : ''} />
            </button>
          </div>

          {/* Benefits List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-[10px] text-[var(--text-tertiary)] uppercase font-semibold border-t border-[var(--border-color)]/50">
            <div className="flex items-center space-x-2">
              <Truck size={14} className="text-[#D4AF37]" />
              <span>Complimentary Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw size={14} className="text-[#D4AF37]" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck size={14} className="text-[#D4AF37]" />
              <span>Secured Checkout</span>
            </div>
          </div>

        </div>
      </div>

      {/* Description Tabs */}
      <div className="border-t border-[var(--border-color)] pt-12 space-y-6">
        <div className="flex justify-center space-x-8 border-b border-[var(--border-color)]/30 pb-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`text-xs uppercase tracking-widest font-semibold pb-3 border-b-2 transition-all ${
              activeTab === 'details' ? 'border-[var(--text-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-tertiary)]'
            }`}
          >
            Product Details
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`text-xs uppercase tracking-widest font-semibold pb-3 border-b-2 transition-all ${
              activeTab === 'shipping' ? 'border-[var(--text-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-tertiary)]'
            }`}
          >
            Fulfillment Info
          </button>
        </div>

        <div className="max-w-3xl mx-auto text-left text-xs leading-relaxed text-[var(--text-secondary)] font-light">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              <p>{product.description}</p>
              {product.sku && <p className="font-semibold text-[var(--text-primary)]">SKU: {product.sku}</p>}
            </div>
          ) : (
            <p>
              All orders are packed by hand in our signature white boxes detailed with hot-stamped gold foil logos. Complimentary express shipping takes 2-4 business days across India. Return requests are accepted on unused creations with original protective seals intact.
            </p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-[var(--border-color)] pt-16">
        <ReviewSystem productId={product._id} reviews={product.reviews} onReviewAdded={fetchProduct} />
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="border-t border-[var(--border-color)] pt-16 space-y-8">
          <div className="text-left space-y-1">
            <h3 className="font-serif text-2xl tracking-wide">You May Also Appreciate</h3>
            <div className="h-0.5 w-12 bg-[#D4AF37]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {related.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
