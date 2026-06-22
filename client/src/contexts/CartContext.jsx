import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('luxe_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('luxe_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, variant = '') => {
    setCartItems((prevItems) => {
      // Find if item already exists with same product ID and variant
      const existsIndex = prevItems.findIndex(
        (item) => item.product === product._id && item.variant === variant
      );

      if (existsIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existsIndex].quantity + quantity;
        // Verify against stock if available
        const maxStock = product.stock ?? 99;
        updated[existsIndex].quantity = Math.min(newQty, maxStock);
        return updated;
      }

      // Add as new item
      return [
        ...prevItems,
        {
          product: product._id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          price: product.price,
          stock: product.stock ?? 99,
          quantity,
          variant,
        },
      ];
    });
  };

  const removeFromCart = (productId, variant = '') => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.product === productId && item.variant === variant))
    );
  };

  const updateQty = (productId, variant = '', quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product === productId && item.variant === variant
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations syncing with server orderController rules:
  // shipping = total >= 200 ? 0 : 15
  // tax = subtotal * 0.08
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal === 0 ? 0 : (subtotal >= 200 ? 0 : 15);
  const taxFee = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shippingFee + taxFee).toFixed(2);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        subtotal,
        shippingFee,
        taxFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
