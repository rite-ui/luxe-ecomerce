import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, Grid3X3, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CATEGORIES = [
  { label: 'All Creations', value: '' },
  { label: 'Fashion Apparel', value: 'fashion' },
  { label: 'Signature Scents', value: 'fragrance' },
  { label: 'Fine Jewelry', value: 'jwellery' },
  { label: 'Luxury Beauty', value: 'beauty' },
  { label: 'Home Accents', value: 'home' },
  { label: 'Accessories', value: 'accessories' },
];

const SORTS = [
  { label: 'Featured & Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highly Rated', value: 'rating' },
  { label: 'Customer Favorites', value: 'popular' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Read URL query params
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = +searchParams.get('page') || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Local Filter state
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Sync inputs with URL changes
  useEffect(() => {
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [minPrice, maxPrice]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (category) query.append('category', category);
        if (search) query.append('search', search);
        if (sort) query.append('sort', sort);
        if (page) query.append('page', page);
        if (minPrice) query.append('minPrice', minPrice);
        if (maxPrice) query.append('maxPrice', maxPrice);
        query.append('limit', '8'); // 8 items per page

        const response = await api.get(`/products?${query.toString()}`);
        if (response.data.success) {
          setProducts(response.data.data);
          setTotalProducts(response.data.total);
          setTotalPages(response.data.pages);
        }
      } catch (err) {
        console.error('Failed to fetch catalog products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, search, sort, page, minPrice, maxPrice]);

  const updateParam = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val === undefined || val === null || val === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, val);
    }
    // Reset page to 1 on filter changes
    if (key !== 'page') newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (minPriceInput) newParams.set('minPrice', minPriceInput);
    else newParams.delete('minPrice');
    if (maxPriceInput) newParams.set('maxPrice', maxPriceInput);
    else newParams.delete('maxPrice');
    newParams.delete('page');
    setSearchParams(newParams);
    setFilterPanelOpen(false);
  };

  const handleClearAll = () => {
    setSearchParams({});
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. Shop Page Header */}
      <div className="text-center space-y-3 py-6">
        <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-wide">
          {category ? CATEGORIES.find(c => c.value === category)?.label : 'The Catalog'}
        </h1>
        {search && (
          <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">
            Search results for: "{search}"
          </p>
        )}
      </div>

      {/* 2. Shop Controls Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-y border-[var(--border-color)] py-4 gap-4">
        {/* Toggle Filters button */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className="flex items-center text-xs uppercase tracking-widest font-semibold text-[var(--text-primary)] hover:text-[var(--color-gold-500)] transition-colors"
          >
            <SlidersHorizontal size={14} className="mr-2" /> Filters
          </button>
          
          <span className="text-xs text-[var(--text-tertiary)] hidden md:inline">
            Showing {products.length} of {totalProducts} creations
          </span>
        </div>

        {/* Category Pill Tabs */}
        <div className="hidden lg:flex space-x-2">
          {CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateParam('category', cat.value)}
              className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-medium border transition-all ${
                category === cat.value
                  ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : 'border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:border-[var(--text-primary)]'
              }`}
            >
              {cat.label.replace(' Apparel', '').replace(' Signature', '').replace(' Fine', '').replace(' Luxury', '')}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown size={12} className="text-[var(--text-tertiary)]" />
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="bg-transparent border border-none py-1 text-xs font-semibold text-[var(--text-primary)] outline-none cursor-pointer uppercase tracking-wider"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Filters Slide-down Panel */}
      {filterPanelOpen && (
        <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs uppercase tracking-widest font-semibold">Refine Selection</h3>
            <button onClick={() => setFilterPanelOpen(false)} className="text-[var(--text-primary)] hover:text-red-500">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Category selection */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold">Maison</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => updateParam('category', cat.value)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-wider border transition-all ${
                      category === cat.value
                        ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                        : 'border-[var(--border-color)] hover:border-[var(--text-primary)]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold">Price Interval</h4>
              <form onSubmit={handlePriceApply} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min (₹)"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
                  />
                  <span className="text-[var(--text-tertiary)]">-</span>
                  <input
                    type="number"
                    placeholder="Max (₹)"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <button type="submit" className="btn-luxe-primary w-full py-2 text-[10px]">
                  Apply Filter
                </button>
              </form>
            </div>

            {/* Clear All */}
            <div className="flex flex-col justify-end space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold hidden md:block">Actions</h4>
              <button
                onClick={handleClearAll}
                className="w-full border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 text-[10px] uppercase tracking-widest font-semibold transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[3/4] w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
              <div className="h-3 w-1/3 bg-[var(--bg-secondary)]" />
              <div className="h-4 w-3/4 bg-[var(--bg-secondary)]" />
              <div className="h-3 w-1/4 bg-[var(--bg-secondary)]" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-[var(--border-color)] space-y-4">
          <p className="text-sm text-[var(--text-tertiary)] italic">No matching creations found.</p>
          <button onClick={handleClearAll} className="btn-luxe-secondary text-xs">
            Show All Creations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      )}

      {/* 5. Pagination Buttons */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-6 pt-10 border-t border-[var(--border-color)]">
          <button
            onClick={() => updateParam('page', page - 1)}
            disabled={page === 1}
            className="flex items-center text-xs uppercase tracking-widest font-semibold text-[var(--text-primary)] disabled:text-[var(--text-tertiary)] disabled:cursor-not-allowed hover:text-[var(--color-gold-500)]"
          >
            <ChevronLeft size={16} className="mr-1" /> Prev
          </button>
          
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => updateParam('page', page + 1)}
            disabled={page === totalPages}
            className="flex items-center text-xs uppercase tracking-widest font-semibold text-[var(--text-primary)] disabled:text-[var(--text-tertiary)] disabled:cursor-not-allowed hover:text-[var(--color-gold-500)]"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      )}

    </div>
  );
};

export default Shop;
