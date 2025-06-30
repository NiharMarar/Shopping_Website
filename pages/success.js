import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';

console.log("🚨 Success page loaded");

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const orderCreatedRef = useRef(false);

  useEffect(() => {
    async function handleSuccess() {
      if (!session_id || orderCreatedRef.current) return;
      setLoading(true);
      try {
        // Fetch Stripe session
        const res = await fetch(`/api/get-stripe-session?session_id=${session_id}`);
        const session = await res.json();
        // Check payment status
        if (session.payment_status !== 'paid') {
          setError('Payment not completed.');
          setLoading(false);
          return;
        }
        // Prevent duplicate order creation
        orderCreatedRef.current = true;
        // Extract metadata
        const metadata = session.metadata || {};
        // Try to get cart items from metadata or localStorage
        let itemsToOrder = [];
        if (metadata.cartItems) {
          try { itemsToOrder = JSON.parse(metadata.cartItems); } catch {}
        } else {
          const stored = localStorage.getItem('checkout_cart_items');
          if (stored) itemsToOrder = JSON.parse(stored);
        }
        // Get shipping info
        let shippingAddress = {};
        if (metadata.shippingAddress) {
          try { shippingAddress = JSON.parse(metadata.shippingAddress); } catch {}
        }
        // Get email
        const email = session.customer_email || metadata.email || '';
        // Call /api/create-order
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: itemsToOrder,
            shippingAddress,
            email,
            user_id: user ? user.id : null,
            session_id
          })
        });
        const orderData = await orderRes.json();
        if (!orderData.success) {
          setError(orderData.error || 'Order creation failed');
          setLoading(false);
          return;
        }
        setOrderCreated(true);
        clearCart();
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    handleSuccess();
  }, [session_id, user, clearCart]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Processing your order...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Thank you for your purchase!</h1>
        <p>Your order has been placed and a confirmation email has been sent.</p>
      </div>
    </div>
  );
}