import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-secondary)] py-16 text-[var(--text-secondary)] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold tracking-widest text-[var(--text-primary)]">L U X E</h3>
            <p className="text-xs leading-relaxed max-w-xs font-light">
              Crafting premium lifestyle experiences since 2026. Curating products with fine quality, elegant materials, and sustainable practices.
            </p>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-primary)]">Client Services</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><Link to="/shop" className="hover:text-[var(--color-gold-500)] transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/profile" className="hover:text-[var(--color-gold-500)] transition-colors">Track Your Order</Link></li>
              <li><a href="#" className="hover:text-[var(--color-gold-500)] transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-[var(--color-gold-500)] transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-primary)]">Collections</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><Link to="/shop?category=fashion" className="hover:text-[var(--color-gold-500)] transition-colors">Fashion Apparel</Link></li>
              <li><Link to="/shop?category=fragrance" className="hover:text-[var(--color-gold-500)] transition-colors">Signature Scents</Link></li>
              <li><Link to="/shop?category=jwellery" className="hover:text-[var(--color-gold-500)] transition-colors">Fine Jewelry</Link></li>
              <li><Link to="/shop?category=beauty" className="hover:text-[var(--color-gold-500)] transition-colors">Luxury Beauty</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-primary)]">The Newsletter</h4>
            <p className="text-xs font-light max-w-xs">
              Subscribe to receive updates on collections, private sales, and curated articles.
            </p>
            {subscribed ? (
              <p className="text-xs text-[var(--color-gold-500)] font-medium">Thank you for joining our private circle.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex border-b border-[var(--text-primary)] py-1.5">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-xs w-full outline-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                />
                <button
                  type="submit"
                  className="text-xs uppercase tracking-widest font-semibold hover:text-[var(--color-gold-500)] transition-colors"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-wider font-light">
          <p>© 2026 LUXE E-Commerce. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-[var(--color-gold-500)]">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--color-gold-500)]">Terms of Service</a>
            <a href="#" className="hover:text-[var(--color-gold-500)]">Cookies Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
