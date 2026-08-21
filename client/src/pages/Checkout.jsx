import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api, { getErrorMessage } from '../services/api';
import { ShieldAlert, CreditCard, Truck, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const { cartItems, subtotal, shippingFee, taxFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login?from=/checkout');
    }
  }, [user, navigate]);

  // Shipping Address Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  });

  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    if (window.Razorpay) return Promise.resolve(true);
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create order on the backend
      const orderItems = cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        variant: item.variant || '',
      }));

      const orderPayload = {
        items: orderItems,
        shippingAddress: formData,
        paymentMethod,
        notes,
      };

      const orderResponse = await api.post('/orders', orderPayload);
      if (!orderResponse.data.success) {
        throw new Error('Failed to record order on server.');
      }

      const orderData = orderResponse.data.data;

      // 2. Handle payment based on payment method
      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/order-success?orderId=${orderData._id}`);
      } else if (paymentMethod === 'razorpay') {
        // Load Razorpay SDK script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Razorpay SDK failed to load. Are you offline?');
        }

        // Get Razorpay Key Config
        const configResponse = await api.get('/payments/config');
        const keyId = configResponse.data.keyId;
        if (!keyId) {
          throw new Error('Razorpay is not configured. Please contact the store administrator.');
        }

        // Create Razorpay Order
        const rzpOrderResponse = await api.post('/payments/order', {
          orderId: orderData._id,
        });
        const rzpOrder = rzpOrderResponse.data.order;

        // Open Razorpay Checkout modal
        const options = {
          key: keyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'LUXE E-Commerce',
          description: `Order ${orderData.orderNumber}`,
          order_id: rzpOrder.id,
          handler: async (response) => {
            try {
              setLoading(true);
              // Confirm payment on backend
              const payPayload = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: user.email,
              };
              await api.put(`/orders/${orderData._id}/pay`, payPayload);
              clearCart();
              navigate(`/order-success?orderId=${orderData._id}`);
            } catch (err) {
              setError(`Payment capture failed: ${getErrorMessage(err)}`);
              setLoading(false);
            }
          },
          prefill: {
            name: formData.fullName,
            email: user.email,
            contact: formData.phone,
          },
          theme: {
            color: '#D4AF37', // Gold brand color
          },
          modal: {
            ondismiss: () => {
              setError('Payment process was cancelled.');
              setLoading(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } else {
        throw new Error('Selected payment method is currently disabled.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-serif">Checkout Not Allowed</h2>
        <p className="text-xs text-[var(--text-tertiary)] font-light">There are no items in your shopping bag.</p>
        <Link to="/shop" className="inline-block btn-luxe-primary text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-left">
      <h1 className="font-serif text-3xl font-semibold tracking-wide border-b border-[var(--border-color)] pb-4">
        Checkout
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 text-xs flex items-center space-x-2">
          <ShieldAlert size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Shipping Form Panel */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-widest font-semibold pb-2 border-b border-[var(--border-color)]/50">
              1. Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Street Address</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">State / Province</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              {/* Zip */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Postal / ZIP Code</label>
                <input
                  type="text"
                  name="zip"
                  required
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                />
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Country</label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Panel */}
          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-widest font-semibold pb-2 border-b border-[var(--border-color)]/50">
              2. Payment Credentials
            </h2>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                paymentMethod === 'razorpay' ? 'border-[#D4AF37] bg-gold-50/5 dark:bg-gold-900/5' : 'border-[var(--border-color)] bg-transparent'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-[#D4AF37]"
                  />
                  <div>
                    <p className="text-xs font-semibold">Credit/Debit Card, UPI, Netbanking (Razorpay)</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">Instant secure checkout using Razorpay payment gateway</p>
                  </div>
                </div>
                <CreditCard size={18} className="text-[#D4AF37]" />
              </label>

              {/* COD Option */}
              <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                paymentMethod === 'cod' ? 'border-[#D4AF37] bg-gold-50/5 dark:bg-gold-900/5' : 'border-[var(--border-color)] bg-transparent'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#D4AF37]"
                  />
                  <div>
                    <p className="text-xs font-semibold">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">Pay by cash or card upon product delivery</p>
                  </div>
                </div>
                <Truck size={18} className="text-[var(--text-primary)]" />
              </label>
            </div>
          </div>

          {/* Delivery Notes */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Delivery Notes (Optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Special instructions for the courier, gate codes, etc."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            />
          </div>
        </div>

        {/* Order Summary Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 space-y-6">
            <h3 className="text-xs uppercase tracking-widest font-semibold border-b border-[var(--border-color)] pb-3">
              Order Summary
            </h3>

            {/* Items review */}
            <div className="max-h-60 overflow-y-auto space-y-4 divide-y divide-[var(--border-color)]/30 pr-1">
              {cartItems.map((item) => (
                <div key={`${item.product}-${item.variant}`} className="flex items-center py-3 first:pt-0 space-x-3">
                  <img src={item.image} alt="" className="h-14 w-11 object-cover bg-neutral-200 border border-[var(--border-color)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">
                      Qty: {item.quantity} {item.variant ? `| ${item.variant}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Billing breakdown */}
            <div className="space-y-2.5 text-xs pt-4 border-t border-[var(--border-color)]">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Standard Delivery</span>
                <span>{shippingFee === 0 ? 'Complimentary' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Estimated Tax (8%)</span>
                <span>₹{taxFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-color)] pt-3 text-sm font-semibold">
                <span>Grand Total</span>
                <span className="text-[var(--color-gold-500)] text-base">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-luxe-gold text-xs py-3.5 flex items-center justify-center space-x-2 disabled:bg-[var(--border-color)] disabled:cursor-not-allowed"
            >
              <CheckCircle size={14} />
              <span>{loading ? 'Processing Order...' : 'Complete Purchase'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
