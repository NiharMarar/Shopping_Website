'use client';

import { useState } from 'react';
import { useCart } from '../lib/CartContext';
import { useRouter } from 'next/router';

export default function CheckoutButton() {
  const { cartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setLoading(true);
    try {
      // Optionally, save cart items to localStorage for guest checkout recovery
      localStorage.setItem('checkout_cart_items', JSON.stringify(cartItems));
      // Navigate to the checkout page
      router.push('/checkout');
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Error proceeding to checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || cartItems.length === 0}
      className={`w-full font-nexus font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-neon border border-cyberpunk-neonPink focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonBlue focus:ring-offset-2 ${loading || cartItems.length === 0 ? 'bg-cyberpunk-surface text-cyberpunk-neonPurple cursor-not-allowed' : 'bg-cyberpunk-neonBlue text-cyberpunk-bg hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg'}`}
    >
      {loading ? 'Processing...' : `Checkout ($${cartItems.reduce((total, item) => total + (item.product.product_price * item.quantity), 0).toFixed(2)})`}
    </button>
  );
} 