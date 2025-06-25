'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Toast from '../components/Toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add product to cart (by id, unique products only)
  function addToCart(product, quantity = 1) {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        // Update quantity
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new product
        return [...prev, { product, quantity }];
      }
    });
  }

  // Remove product from cart
  function removeFromCart(productId) {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  }

  // Clear cart
  function clearCart() {
    setCartItems([]);
  }

  // Unique product count (for cart bubble)
  const uniqueCount = cartItems.length;

  function showToast(message) {
    setToast({ visible: true, message });
  }

  function handleToastClose() {
    setToast({ visible: false, message: '' });
  }

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, uniqueCount, showToast }}>
      {children}
      <Toast message={toast.message} visible={toast.visible} onClose={handleToastClose} />
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 