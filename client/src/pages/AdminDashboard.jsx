import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { getErrorMessage } from '../services/api';
import { LayoutDashboard, ShoppingBag, ClipboardList, Users, TrendingUp, DollarSign, Plus, Edit, Trash2, ShieldAlert, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Route security block
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Helper to resolve status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-500 border-green-500/10 bg-green-500/5';
      case 'shipped':   return 'text-blue-500 border-blue-500/10 bg-blue-500/5';
      case 'processing':return 'text-amber-500 border-amber-500/10 bg-amber-500/5';
      case 'cancelled': return 'text-red-500 border-red-500/10 bg-red-500/5';
      default:          return 'text-neutral-500 border-neutral-500/10 bg-neutral-500/5';
    }
  };

  const [activeSubTab, setActiveSubTab] = useState('stats');

  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Products CRUD State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    comparePrice: '',
    category: 'fashion',
    brand: '',
    description: '',
    shortDescription: '',
    stock: '',
    imageUrls: '', // comma separated urls for ease
    variantOptions: '', // comma separated options
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: 'pending',
    note: '',
    trackingNumber: '',
  });

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Load Dashboard Overview Stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to retrieve overview stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load Admin Products list
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      // Query higher limit for admin catalog
      const response = await api.get('/products?limit=100');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load products list:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load Admin Orders list
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await api.get('/admin/orders?limit=100');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error('Failed to retrieve all customer orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load Admin Users List
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsersList(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load users directory:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Hook tab triggers
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    if (activeSubTab === 'stats') fetchStats();
    if (activeSubTab === 'products') fetchProducts();
    if (activeSubTab === 'orders') fetchOrders();
    if (activeSubTab === 'users') fetchUsers();
  }, [activeSubTab, user]);

  // Product actions handlers
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      comparePrice: '',
      category: 'fashion',
      brand: '',
      description: '',
      shortDescription: '',
      stock: '',
      imageUrls: '',
      variantOptions: '',
    });
    setProductModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: prod.price,
      comparePrice: prod.comparePrice || '',
      category: prod.category,
      brand: prod.brand || '',
      description: prod.description,
      shortDescription: prod.shortDescription || '',
      stock: prod.stock,
      imageUrls: prod.images?.map((img) => img.url).join(', ') || '',
      variantOptions: prod.variants?.[0]?.options?.join(', ') || '',
    });
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const imagesPayload = productForm.imageUrls
        ? productForm.imageUrls.split(',').map((url) => ({ url: url.trim() }))
        : [];
      
      const variantsPayload = productForm.variantOptions
        ? [{ name: 'options', options: productForm.variantOptions.split(',').map((o) => o.trim()) }]
        : [];

      const payload = {
        name: productForm.name,
        price: +productForm.price,
        comparePrice: productForm.comparePrice ? +productForm.comparePrice : 0,
        category: productForm.category,
        brand: productForm.brand,
        description: productForm.description,
        shortDescription: productForm.shortDescription,
        stock: +productForm.stock,
        images: imagesPayload,
        variants: variantsPayload,
      };

      if (editingProduct) {
        // Edit Product (PUT /api/products/:id)
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        // Add Product (POST /api/products)
        await api.post('/products', payload);
      }

      setProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(`Product submit failed: ${getErrorMessage(err)}`);
    }
  };

  const handleProductDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to remove this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(`Product deletion error: ${getErrorMessage(err)}`);
    }
  };

  // Order Fulfillment Updates
  const handleOpenOrderModal = (ord) => {
    setSelectedOrder(ord);
    setStatusUpdateForm({
      status: ord.status,
      note: '',
      trackingNumber: ord.trackingNumber || '',
    });
  };

  const handleOrderStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      // PUT /api/admin/orders/:id/status
      await api.put(`/admin/orders/${selectedOrder._id}/status`, {
        status: statusUpdateForm.status,
        note: statusUpdateForm.note,
        trackingNumber: statusUpdateForm.trackingNumber,
      });
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(`Order status update failed: ${getErrorMessage(err)}`);
    }
  };

  // User Administration removal
  const handleUserDelete = async (uid) => {
    if (!window.confirm('Delete user profile permanently?')) return;
    try {
      await api.delete(`/users/${uid}`);
      fetchUsers();
    } catch (err) {
      alert(`User profile deletion failed: ${getErrorMessage(err)}`);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-wide flex items-center">
          <LayoutDashboard className="mr-3 text-[#D4AF37]" size={28} /> Admin Console
        </h1>
        <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mt-1">
          Luxe Boutique Global Administration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Navigation Tabs Panel */}
        <div className="flex flex-col space-y-1.5 border border-[var(--border-color)] p-4 bg-[var(--bg-primary)]">
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`w-full flex items-center px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeSubTab === 'stats'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <TrendingUp size={14} className="mr-3" /> Overview Analytics
          </button>
          <button
            onClick={() => setActiveSubTab('products')}
            className={`w-full flex items-center px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeSubTab === 'products'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <ShoppingBag size={14} className="mr-3" /> Manage Products
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`w-full flex items-center px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeSubTab === 'orders'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <ClipboardList size={14} className="mr-3" /> Manage Orders
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`w-full flex items-center px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeSubTab === 'users'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Users size={14} className="mr-3" /> Manage Users
          </button>
        </div>

        {/* Dynamic tabs details container */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Subtab 1: Overview Analytics */}
          {activeSubTab === 'stats' && (
            <div className="space-y-10">
              {statsLoading || !stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Quick Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="border border-[var(--border-color)] p-6 bg-[var(--bg-secondary)] space-y-1">
                      <DollarSign size={20} className="text-[#D4AF37]" />
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Gross Income</p>
                      <p className="text-xl font-bold font-serif">₹{stats.revenue?.toLocaleString()}</p>
                    </div>
                    <div className="border border-[var(--border-color)] p-6 bg-[var(--bg-secondary)] space-y-1">
                      <ShoppingBag size={20} className="text-[#D4AF37]" />
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Total Sales</p>
                      <p className="text-xl font-bold font-serif">{stats.totalOrders}</p>
                    </div>
                    <div className="border border-[var(--border-color)] p-6 bg-[var(--bg-secondary)] space-y-1">
                      <Users size={20} className="text-[#D4AF37]" />
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Active Buyers</p>
                      <p className="text-xl font-bold font-serif">{stats.totalUsers}</p>
                    </div>
                    <div className="border border-[var(--border-color)] p-6 bg-[var(--bg-secondary)] space-y-1">
                      <TrendingUp size={20} className="text-[#D4AF37]" />
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Creations Cataloged</p>
                      <p className="text-xl font-bold font-serif">{stats.totalProducts}</p>
                    </div>
                  </div>

                  {/* Visual Graph segment */}
                  {stats.monthlyRevenue?.length > 0 && (
                    <div className="border border-[var(--border-color)] p-6">
                      <h3 className="text-xs uppercase tracking-widest font-semibold border-b border-[var(--border-color)] pb-3 mb-6">
                        Monthly Revenue Analysis (Last 6 Months)
                      </h3>
                      <div className="h-64 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.monthlyRevenue.map(m => ({
                            name: `M${m._id.month}/${m._id.year}`,
                            Revenue: m.revenue
                          }))}>
                            <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={10} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
                            <Bar dataKey="Revenue" fill="#D4AF37" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Split Lists column: top selling & recent orders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Top Products */}
                    <div className="border border-[var(--border-color)] p-6 space-y-4">
                      <h3 className="text-xs uppercase tracking-widest font-semibold border-b border-[var(--border-color)] pb-3">
                        Top-Selling Creations
                      </h3>
                      <div className="divide-y divide-[var(--border-color)]/30">
                        {stats.topProducts?.map((tp) => (
                          <div key={tp._id} className="py-2.5 flex items-center justify-between">
                            <span className="text-xs font-light truncate max-w-xs">{tp.name}</span>
                            <span className="text-xs font-bold text-[#D4AF37]">{tp.sold} sold</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="border border-[var(--border-color)] p-6 space-y-4">
                      <h3 className="text-xs uppercase tracking-widest font-semibold border-b border-[var(--border-color)] pb-3">
                        Recent Invoices
                      </h3>
                      <div className="divide-y divide-[var(--border-color)]/30">
                        {stats.recentOrders?.map((ro) => (
                          <div key={ro._id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="font-light truncate max-w-[150px]">
                              {ro.user?.name || 'Guest User'}
                            </div>
                            <span className="font-semibold text-neutral-500">₹{ro.totalPrice.toLocaleString()}</span>
                            <span className={`text-[9px] border px-1.5 uppercase font-semibold ${
                              ro.isPaid ? 'border-green-500 text-green-500' : 'border-amber-500 text-amber-500'
                            }`}>
                              {ro.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Subtab 2: Products management */}
          {activeSubTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-[var(--border-color)]/30 pb-3">
                <h2 className="text-lg font-serif font-semibold">Store Creations Catalog</h2>
                <button onClick={handleOpenAddModal} className="btn-luxe-primary text-xs py-2 px-4 flex items-center">
                  <Plus size={12} className="mr-1" /> Add Creation
                </button>
              </div>

              {productsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] italic">No products cataloged.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[var(--text-tertiary)] uppercase tracking-wider">
                        <th className="py-3 font-semibold">Creations</th>
                        <th className="py-3 font-semibold">Maison</th>
                        <th className="py-3 font-semibold">Price</th>
                        <th className="py-3 font-semibold">Stock</th>
                        <th className="py-3 font-semibold">Sold</th>
                        <th className="py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/30">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                          <td className="py-3 pr-2 flex items-center space-x-2">
                            <img src={prod.images?.[0]?.url} alt="" className="h-10 w-8 object-cover bg-neutral-200" />
                            <span className="font-medium line-clamp-1 max-w-[150px]">{prod.name}</span>
                          </td>
                          <td className="py-3 uppercase tracking-wider text-[10px]">{prod.category}</td>
                          <td className="py-3">₹{prod.price?.toLocaleString()}</td>
                          <td className="py-3">{prod.stock}</td>
                          <td className="py-3">{prod.sold}</td>
                          <td className="py-3 text-right space-x-2">
                            <button onClick={() => handleOpenEditModal(prod)} className="text-blue-500 hover:text-blue-700" title="Edit">
                              <Edit size={14} className="inline" />
                            </button>
                            <button onClick={() => handleProductDelete(prod._id)} className="text-red-500 hover:text-red-700" title="Delete">
                              <Trash2 size={14} className="inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Subtab 3: Manage Orders */}
          {activeSubTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-lg font-serif font-semibold border-b border-[var(--border-color)]/30 pb-3">
                Customer Sales Logs
              </h2>

              {ordersLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] italic">No customer orders recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[var(--text-tertiary)] uppercase tracking-wider">
                        <th className="py-3 font-semibold">Order</th>
                        <th className="py-3 font-semibold">User</th>
                        <th className="py-3 font-semibold">Price</th>
                        <th className="py-3 font-semibold">Payment</th>
                        <th className="py-3 font-semibold">Status</th>
                        <th className="py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/30">
                      {orders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                          <td className="py-3 font-serif font-semibold text-[var(--color-gold-500)]">{ord.orderNumber}</td>
                          <td className="py-3 pr-2">
                            <p className="font-semibold">{ord.user?.name || 'Deleted Account'}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)]">{ord.user?.email}</p>
                          </td>
                          <td className="py-3">₹{ord.totalPrice?.toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`text-[9px] border px-1.5 uppercase font-semibold ${
                              ord.isPaid ? 'border-green-500/20 bg-green-500/5 text-green-500' : 'border-amber-500/20 bg-amber-500/5 text-amber-500'
                            }`}>
                              {ord.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`text-[9px] uppercase tracking-wider font-semibold border px-2 py-0.5 ${getStatusColor(ord.status)}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button onClick={() => handleOpenOrderModal(ord)} className="btn-luxe-primary py-1 px-2.5 text-[9px]">
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Subtab 4: Manage Users */}
          {activeSubTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-lg font-serif font-semibold border-b border-[var(--border-color)]/30 pb-3">
                Users Directory Database
              </h2>

              {usersLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
                  ))}
                </div>
              ) : usersList.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] italic">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[var(--text-tertiary)] uppercase tracking-wider">
                        <th className="py-3 font-semibold">User</th>
                        <th className="py-3 font-semibold">Email</th>
                        <th className="py-3 font-semibold">Role</th>
                        <th className="py-3 font-semibold">Registered</th>
                        <th className="py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/30">
                      {usersList.map((u) => (
                        <tr key={u._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                          <td className="py-3 font-semibold">{u.name}</td>
                          <td className="py-3">{u.email}</td>
                          <td className="py-3 uppercase tracking-widest text-[9px] font-semibold text-[#D4AF37]">{u.role}</td>
                          <td className="py-3 font-light text-[var(--text-tertiary)]">
                            {new Date(u.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 text-right">
                            {u.role !== 'admin' && (
                              <button onClick={() => handleUserDelete(u._id)} className="text-red-500 hover:text-red-700" title="Delete User">
                                <Trash2 size={14} className="inline" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: Product Add / Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setProductModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 sm:p-8 space-y-6 shadow-2xl z-10 text-left">
            
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-serif font-semibold">
                {editingProduct ? `Edit Creation: ${editingProduct.name}` : 'Catalog New Creation'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-[var(--text-primary)] hover:text-red-500">
                Cancel
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Product Name</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={productForm.name}
                  onChange={handleProductFormChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Brand</label>
                <input
                  type="text"
                  required
                  name="brand"
                  value={productForm.brand}
                  onChange={handleProductFormChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Price (₹)</label>
                <input
                  type="number"
                  required
                  name="price"
                  value={productForm.price}
                  onChange={handleProductFormChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Compare Price (₹)</label>
                <input
                  type="number"
                  name="comparePrice"
                  value={productForm.comparePrice}
                  onChange={handleProductFormChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Category</label>
                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleProductFormChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none text-[var(--text-primary)]"
                >
                  <option value="fashion">Fashion Apparel</option>
                  <option value="fragrance">Signature Scents</option>
                  <option value="jwellery">Fine Jewelry</option>
                  <option value="beauty">Luxury Beauty</option>
                  <option value="home">Home Accents</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Stock Qty</label>
                <input
                  type="number"
                  required
                  name="stock"
                  value={productForm.stock}
                  onChange={handleProductFormChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Image URLs (comma separated)</label>
                <input
                  type="text"
                  name="imageUrls"
                  value={productForm.imageUrls}
                  onChange={handleProductFormChange}
                  placeholder="https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Variant Options (comma separated)</label>
                <input
                  type="text"
                  name="variantOptions"
                  value={productForm.variantOptions}
                  onChange={handleProductFormChange}
                  placeholder="S, M, L, XL or 50ml, 100ml"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Short Catalog Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={productForm.shortDescription}
                  onChange={handleProductFormChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Full Editorial Description</label>
                <textarea
                  rows={4}
                  required
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-4">
                <button type="submit" className="w-full btn-luxe-primary py-2.5 text-xs">
                  {editingProduct ? 'Save Creation' : 'Publish Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Order status update modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 space-y-6 shadow-2xl z-10 text-left text-xs">
            
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-serif font-semibold">
                Fulfill Order {selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-[var(--text-primary)] hover:text-red-500">
                Cancel
              </button>
            </div>

            <form onSubmit={handleOrderStatusSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Fulfillment Status</label>
                <select
                  value={statusUpdateForm.status}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value })}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none text-[var(--text-primary)]"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Tracking Number (Courier)</label>
                <input
                  type="text"
                  value={statusUpdateForm.trackingNumber}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, trackingNumber: e.target.value })}
                  placeholder="E.g., BLUEDART-xxxxxx"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">Status Note</label>
                <input
                  type="text"
                  value={statusUpdateForm.note}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, note: e.target.value })}
                  placeholder="E.g. Package dispatched from Mumbai sorting facility"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 outline-none"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full btn-luxe-primary py-2 text-xs flex items-center justify-center space-x-2">
                  <Check size={14} />
                  <span>Update Order Fulfillments</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
