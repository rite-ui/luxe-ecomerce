import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, updateQty, removeFromCart, subtotal, shippingFee, taxFee, total } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        {/* Drawer Content */}
        <div className="w-screen max-w-md bg-[var(--bg-primary)] border-l border-[var(--border-color)] flex flex-col justify-between shadow-2xl transition-all duration-300">
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="text-lg font-serif font-semibold tracking-wide flex items-center">
              <ShoppingBag size={18} className="mr-2 text-[var(--color-gold-500)]" /> Shopping Bag ({cartItems.length})
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--text-primary)] hover:text-[var(--color-gold-500)] p-1 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 text-center py-12">
                <ShoppingBag size={48} className="text-[var(--text-tertiary)] stroke-[1]" />
                <p className="text-sm font-light text-[var(--text-tertiary)]">Your shopping bag is empty.</p>
                <button
                  onClick={() => { onClose(); navigate('/shop'); }}
                  className="btn-luxe-primary text-xs"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.product}-${item.variant}`} className="flex items-start py-4 border-b border-[var(--border-color)]/50 last:border-b-0 space-x-4">
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-16 object-cover object-center bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                  />

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xs font-serif font-medium leading-normal line-clamp-1">{item.name}</h3>
                    {item.variant && (
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                        Variant: {item.variant}
                      </p>
                    )}
                    <p className="text-xs font-semibold">₹{item.price.toLocaleString()}</p>
                    
                    {/* Quantity Selector & Trash */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                        <button
                          onClick={() => updateQty(item.product, item.variant, item.quantity - 1)}
                          className="px-2 py-1 text-[var(--text-primary)] hover:text-[var(--color-gold-500)]"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-2 text-xs font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.product, item.variant, item.quantity + 1)}
                          className="px-2 py-1 text-[var(--text-primary)] hover:text-[var(--color-gold-500)]"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product, item.variant)}
                        className="text-[var(--text-tertiary)] hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Panel & Checkout */}
          {cartItems.length > 0 && (
            <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-6 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-light text-[var(--text-secondary)]">Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-light text-[var(--text-secondary)]">Shipping</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? 'Complimentary' : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-light text-[var(--text-secondary)]">Estimated Tax (8%)</span>
                  <span className="font-semibold">₹{taxFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--border-color)] pt-3 text-sm font-semibold">
                  <span>Grand Total</span>
                  <span className="text-[var(--color-gold-500)]">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full btn-luxe-gold text-xs py-3"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
