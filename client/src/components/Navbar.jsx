import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { ShoppingBag, Heart, Search, User, Moon, Sun, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';

const Navbar = ({ onCartToggle }) => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Mobile Menu Icon */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[var(--text-primary)] hover:text-[var(--color-gold-500)] focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex md:space-x-8">
            <Link to="/" className="text-sm font-medium tracking-widest uppercase hover:text-[var(--color-gold-500)] transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-sm font-medium tracking-widest uppercase hover:text-[var(--color-gold-500)] transition-colors">
              Shop
            </Link>
            <Link to="/shop?category=fashion" className="text-sm font-medium tracking-widest uppercase hover:text-[var(--color-gold-500)] transition-colors">
              Fashion
            </Link>
            <Link to="/shop?category=fragrance" className="text-sm font-medium tracking-widest uppercase hover:text-[var(--color-gold-500)] transition-colors">
              Fragrance
            </Link>
          </div>

          {/* Logo */}
          <div className="flex-1 text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link to="/" className="font-serif text-3xl font-semibold tracking-widest text-[var(--text-primary)] hover:opacity-90">
              L U X E
            </Link>
          </div>

          {/* Icons Section */}
          <div className="flex items-center space-x-5">
            {/* Search Toggle */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-none px-2 py-1 w-48 sm:w-64 transition-all duration-300">
                  <input
                    type="text"
                    placeholder="Search collection..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm w-full outline-none px-1 text-[var(--text-primary)]"
                    autoFocus
                  />
                  <button type="submit" className="text-[var(--text-primary)] hover:text-[var(--color-gold-500)]">
                    <Search size={16} />
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="ml-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-[var(--text-primary)] hover:text-[var(--color-gold-500)] transition-colors"
                >
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-[var(--text-primary)] hover:text-[var(--color-gold-500)] transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Profile Menu */}
            <div className="group relative">
              {user ? (
                <div className="flex items-center cursor-pointer space-x-1 py-2">
                  <User size={20} className="text-[var(--text-primary)] group-hover:text-[var(--color-gold-500)] transition-colors" />
                  <span className="hidden lg:inline text-xs tracking-wider uppercase font-medium max-w-[80px] truncate">
                    {user.name}
                  </span>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 hidden w-48 border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg group-hover:block transition-all duration-300">
                    <div className="p-4 border-b border-[var(--border-color)]">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center px-4 py-2.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--color-gold-500)]">
                      My Profile
                    </Link>
                    <Link to="/profile?tab=wishlist" className="flex items-center px-4 py-2.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--color-gold-500)]">
                      <Heart size={12} className="mr-2" /> Wishlist ({user.wishlist?.length || 0})
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center px-4 py-2.5 text-xs text-[var(--color-gold-500)] font-medium hover:bg-[var(--bg-secondary)]">
                        <LayoutDashboard size={12} className="mr-2" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex w-full items-center px-4 py-2.5 text-left text-xs text-red-500 hover:bg-[var(--bg-secondary)]"
                    >
                      <LogOut size={12} className="mr-2" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="text-[var(--text-primary)] hover:text-[var(--color-gold-500)] transition-colors">
                  <User size={20} />
                </Link>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onCartToggle}
              className="relative flex items-center text-[var(--text-primary)] hover:text-[var(--color-gold-500)] transition-colors"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center bg-[var(--text-primary)] text-[10px] font-bold text-[var(--bg-primary)] rounded-full border border-[var(--bg-primary)]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Links Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-4 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium tracking-widest uppercase text-[var(--text-primary)] hover:text-[var(--color-gold-500)]"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium tracking-widest uppercase text-[var(--text-primary)] hover:text-[var(--color-gold-500)]"
          >
            Shop
          </Link>
          <Link
            to="/shop?category=fashion"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium tracking-widest uppercase text-[var(--text-primary)] hover:text-[var(--color-gold-500)]"
          >
            Fashion
          </Link>
          <Link
            to="/shop?category=fragrance"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium tracking-widest uppercase text-[var(--text-primary)] hover:text-[var(--color-gold-500)]"
          >
            Fragrance
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
