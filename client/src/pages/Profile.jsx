import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { getErrorMessage } from '../services/api';
import ProductCard from '../components/ProductCard';
import { User, ShoppingBag, Heart, Settings, ShieldAlert, Key, ClipboardList, ChevronDown, ChevronUp, Clock, Package } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'orders';

  // Navigation state
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Profile settings state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Password fields state
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Orders list state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Wishlist products detail state
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Messages/error states
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState(null);

  // Force login check
  useEffect(() => {
    if (!user) {
      navigate('/login?from=/profile');
    }
  }, [user, navigate]);

  // Handle active tab URL synchrony
  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  // Load orders when active tab is orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (activeTab !== 'orders' || !user) return;
      setOrdersLoading(true);
      try {
        const response = await api.get('/orders/my?limit=20');
        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab, user]);

  // Load wishlist details when active tab is wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (activeTab !== 'wishlist' || !user || !user.wishlist?.length) {
        setWishlistProducts([]);
        return;
      }
      setWishlistLoading(true);
      try {
        const productsList = [];
        // Fetch each product detail. Alternatively, we could query them all or make a batch call.
        // Let's do it sequentially or promise.all since the backend productById endpoint supports ID retrieval.
        const promises = user.wishlist.map((pid) => api.get(`/products/${pid}`).catch(() => null));
        const results = await Promise.all(promises);
        
        results.forEach((res) => {
          if (res && res.data?.success) {
            productsList.push(res.data.data);
          }
        });
        setWishlistProducts(productsList);
      } catch (err) {
        console.error('Failed to retrieve wishlist items detail:', err);
      } finally {
        setWishlistLoading(false);
      }
    };
    fetchWishlist();
  }, [activeTab, user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError(null);
    try {
      await updateProfile(profileForm);
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(getErrorMessage(err));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassSuccess(false);
    setPassError(null);

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      await changePassword(passForm.currentPassword, passForm.newPassword);
      setPassSuccess(true);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(getErrorMessage(err));
    }
  };

  const toggleOrderAccordion = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  // Helper to resolve status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-500 border-green-500/10 bg-green-500/5';
      case 'shipped':
        return 'text-blue-500 border-blue-500/10 bg-blue-500/5';
      case 'processing':
        return 'text-amber-500 border-amber-500/10 bg-amber-500/5';
      case 'cancelled':
        return 'text-red-500 border-red-500/10 bg-red-500/5';
      default:
        return 'text-neutral-500 border-neutral-500/10 bg-neutral-500/5';
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[var(--border-color)] gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-wide text-[var(--text-primary)]">
            My Account
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest font-light mt-1">
            Registered: {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2">
          <User size={14} className="text-[#D4AF37]" />
          <span className="font-semibold">{user.name} ({user.role})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar Panel */}
        <div className="flex flex-col space-y-1.5 border border-[var(--border-color)] p-4 bg-[var(--bg-primary)]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <ShoppingBag size={14} className="mr-3" /> Orders History
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'wishlist'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Heart size={14} className="mr-3" /> Wishlist ({user.wishlist?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Settings size={14} className="mr-3" /> Profile Settings
          </button>
        </div>

        {/* Dynamic content column */}
        <div className="lg:col-span-3">
          
          {/* Tab 1: Orders History */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-lg font-serif font-semibold border-b border-[var(--border-color)]/30 pb-3 flex items-center">
                <ClipboardList size={18} className="mr-2 text-[#D4AF37]" /> Your Order Archives
              </h2>

              {ordersLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--border-color)]">
                  <p className="text-xs text-[var(--text-tertiary)] italic font-light">
                    No orders have been recorded under this account yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isOpen = expandedOrder === order._id;
                    const itemsText = order.items?.map((it) => `${it.name} (x${it.quantity})`).join(', ');
                    return (
                      <div key={order._id} className="border border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden">
                        {/* Summary Line */}
                        <div
                          onClick={() => toggleOrderAccordion(order._id)}
                          className="px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors gap-3"
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-serif font-bold text-[var(--color-gold-500)]">{order.orderNumber}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)]">
                              Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>

                          <div className="text-xs font-semibold text-[var(--text-primary)]">
                            ₹{order.totalPrice.toLocaleString()}
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className={`text-[9px] uppercase tracking-wider font-semibold border px-2 py-0.5 ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>

                        {/* Accordion Details */}
                        {isOpen && (
                          <div className="px-6 pb-6 pt-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 space-y-6 text-xs transition-all duration-300">
                            {/* Items List */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold">Items</h4>
                              <div className="divide-y divide-[var(--border-color)]/30">
                                {order.items?.map((it) => (
                                  <div key={it.product} className="py-2 flex justify-between">
                                    <span className="font-light">{it.name} <span className="font-semibold text-[var(--text-primary)]">x{it.quantity}</span> {it.variant ? `(${it.variant})` : ''}</span>
                                    <span className="font-semibold">₹{(it.price * it.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tracking and Address Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[var(--border-color)]/30">
                              <div>
                                <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-1.5">Shipping Destination</h4>
                                <p className="font-medium">{order.shipping?.fullName || order.shippingAddress?.fullName}</p>
                                <p className="font-light text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                                  {order.shipping?.street || order.shippingAddress?.street}, {order.shipping?.city || order.shippingAddress?.city},{' '}
                                  {order.shipping?.state || order.shippingAddress?.state} - {order.shipping?.zip || order.shippingAddress?.zip},{' '}
                                  {order.shipping?.country || order.shippingAddress?.country}
                                </p>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-1">Billing Summary</h4>
                                  <div className="space-y-1 font-light text-[var(--text-secondary)]">
                                    <div className="flex justify-between"><span>Items Subtotal</span><span>₹{order.itemsPrice?.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>Delivery</span><span>₹{order.shippingPrice?.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>Tax</span><span>₹{order.taxPrice?.toLocaleString()}</span></div>
                                  </div>
                                </div>
                                {order.trackingNumber && (
                                  <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-0.5">Tracking Number</h4>
                                    <p className="font-serif font-semibold text-[var(--color-gold-500)]">{order.trackingNumber}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status Timeline History */}
                            <div className="pt-4 border-t border-[var(--border-color)]/30">
                              <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">Fulfillment Journey</h4>
                              <div className="relative pl-6 space-y-4 border-l border-[var(--border-color)] ml-2">
                                {order.statusHistory?.map((hist, idx) => (
                                  <div key={idx} className="relative">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[29px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--text-primary)] border-2 border-[var(--bg-primary)]" />
                                    <div>
                                      <p className="font-semibold uppercase tracking-wider text-[9px]">{hist.status}</p>
                                      {hist.note && <p className="text-[10px] text-[var(--text-secondary)] font-light mt-0.5">{hist.note}</p>}
                                      <p className="text-[8px] text-[var(--text-tertiary)] mt-0.5">
                                        {new Date(hist.createdAt).toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Wishlist Catalog */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-lg font-serif font-semibold border-b border-[var(--border-color)]/30 pb-3 flex items-center">
                <Heart size={18} className="mr-2 text-red-500 fill-red-500" /> Favorites Collection
              </h2>

              {wishlistLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse space-y-4">
                      <div className="aspect-[3/4] w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
                      <div className="h-4 w-3/4 bg-[var(--bg-secondary)]" />
                      <div className="h-3 w-1/4 bg-[var(--bg-secondary)]" />
                    </div>
                  ))}
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--border-color)]">
                  <p className="text-xs text-[var(--text-tertiary)] italic font-light">
                    Your wishlist is currently empty.
                  </p>
                  <Link to="/shop" className="inline-block border-b border-[var(--text-primary)] text-[10px] uppercase font-semibold mt-2 tracking-widest">
                    Catalog Explore
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistProducts.map((prod) => (
                    <ProductCard key={prod._id} product={prod} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Profile settings & address edits */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Profile Details Edit */}
              <div className="border border-[var(--border-color)] p-6 space-y-4">
                <h3 className="text-sm uppercase tracking-widest font-semibold border-b border-[var(--border-color)] pb-2 flex items-center">
                  <User size={14} className="mr-2 text-[#D4AF37]" /> Personal Settings
                </h3>

                {profileSuccess && (
                  <p className="text-xs text-green-500 font-semibold bg-green-500/10 p-2 border border-green-500/20">
                    Profile settings saved successfully.
                  </p>
                )}
                {profileError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 text-xs flex items-center space-x-1">
                    <ShieldAlert size={12} className="shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2 text-xs outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2 text-xs outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                  <button type="submit" className="w-full btn-luxe-primary text-xs py-2">
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Password update */}
              <div className="border border-[var(--border-color)] p-6 space-y-4">
                <h3 className="text-sm uppercase tracking-widest font-semibold border-b border-[var(--border-color)] pb-2 flex items-center">
                  <Key size={14} className="mr-2 text-[#D4AF37]" /> Security Credentials
                </h3>

                {passSuccess && (
                  <p className="text-xs text-green-500 font-semibold bg-green-500/10 p-2 border border-green-500/20">
                    Password updated successfully.
                  </p>
                )}
                {passError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 text-xs flex items-center space-x-1">
                    <ShieldAlert size={12} className="shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2 text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">New Password</label>
                    <input
                      type="password"
                      required
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2 text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={passForm.confirmPassword}
                      onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2 text-xs outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full btn-luxe-primary text-xs py-2">
                    Update Password
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Profile;
