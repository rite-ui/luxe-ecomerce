import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { CheckCircle2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get(`/orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.data);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-12 bg-[var(--bg-secondary)] mx-auto rounded-full" />
          <div className="h-6 w-1/3 bg-[var(--bg-secondary)] mx-auto" />
          <div className="h-4 w-2/3 bg-[var(--bg-secondary)] mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-serif text-red-500">Order Information Error</h2>
        <p className="text-xs text-[var(--text-tertiary)]">{error || 'Order ID is missing or invalid.'}</p>
        <Link to="/shop" className="inline-block btn-luxe-primary text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center space-y-10">
      
      {/* 1. Success Message */}
      <div className="space-y-4">
        <div className="flex justify-center text-[var(--color-gold-500)] animate-bounce">
          <CheckCircle2 size={56} className="stroke-[1.2]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-wide text-[var(--text-primary)]">
          Purchase Confirmed
        </h1>
        <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] max-w-md mx-auto leading-relaxed font-light">
          Your order has been recorded into our archives. A confirmation message was dispatched to your email address.
        </p>
      </div>

      {/* 2. Order Metadata Info */}
      <div className="border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 sm:p-8 space-y-6 text-left">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[var(--border-color)] pb-4 gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Order Number</p>
            <p className="text-sm font-semibold font-serif text-[var(--color-gold-500)]">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Estimated Delivery</p>
            <p className="text-xs font-semibold text-[var(--text-primary)] flex items-center">
              <Truck size={12} className="mr-1.5 text-[#D4AF37]" /> 2-4 Business Days
            </p>
          </div>
        </div>

        {/* Shipping address summary */}
        <div>
          <h3 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-2">Delivery Destination</h3>
          <p className="text-xs font-medium text-[var(--text-primary)]">{order.shipping?.fullName || order.shippingAddress?.fullName}</p>
          <p className="text-xs font-light text-[var(--text-secondary)] mt-0.5">
            {order.shipping?.street || order.shippingAddress?.street}, {order.shipping?.city || order.shippingAddress?.city},{' '}
            {order.shipping?.state || order.shippingAddress?.state} - {order.shipping?.zip || order.shippingAddress?.zip},{' '}
            {order.shipping?.country || order.shippingAddress?.country}
          </p>
        </div>

        {/* Items Summary list */}
        <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
          <h3 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold">Creations Ordered</h3>
          <div className="divide-y divide-[var(--border-color)]/30 max-h-48 overflow-y-auto pr-1">
            {order.items?.map((item) => (
              <div key={item.product} className="flex justify-between items-center py-2.5 first:pt-0">
                <span className="text-xs font-light text-[var(--text-secondary)] truncate max-w-xs">
                  {item.name} <span className="font-semibold text-[var(--text-primary)]">x{item.quantity}</span>
                </span>
                <span className="text-xs font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Cost details */}
        <div className="flex justify-between items-baseline border-t border-[var(--border-color)] pt-4 text-xs font-semibold">
          <span className="uppercase tracking-wider">Total Invoiced</span>
          <span className="text-base text-[var(--color-gold-500)]">₹{order.totalPrice?.toLocaleString()}</span>
        </div>

        {/* Paid status banner */}
        <div className={`p-3 text-center text-[10px] uppercase tracking-widest font-semibold border ${
          order.isPaid
            ? 'border-green-500/20 bg-green-500/10 text-green-500'
            : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
        }`}>
          Payment Status: {order.isPaid ? `PAID via ${order.paymentMethod.toUpperCase()}` : 'PENDING ON DELIVERY'}
        </div>
      </div>

      {/* 3. Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/profile?tab=orders" className="btn-luxe-secondary text-xs py-3">
          Manage My Orders
        </Link>
        <Link to="/shop" className="btn-luxe-primary text-xs py-3 flex items-center justify-center space-x-1.5">
          <ShoppingBag size={12} />
          <span>Continue Shopping</span>
          <ArrowRight size={12} className="ml-1" />
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;
