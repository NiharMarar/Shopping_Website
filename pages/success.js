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
  const processingRef = useRef(false);

  useEffect(() => {
    async function handleSuccess() {
      if (!session_id || orderCreatedRef.current || processingRef.current) return;
      
      processingRef.current = true;
      setLoading(true);
      
      try {
        console.log('🔄 Processing success page for session:', session_id);
        
        // Fetch Stripe session
        const res = await fetch(`/api/get-stripe-session?session_id=${session_id}`);
        const session = await res.json();
        
        console.log('📦 Stripe session:', session);
        
        // Check payment status
        if (session.payment_status !== 'paid') {
          setError('Payment not completed.');
          setLoading(false);
          return;
        }

        // Get session token from metadata
        const sessionToken = session.metadata?.sessionToken;
        if (!sessionToken) {
          setError('Invalid session data.');
          setLoading(false);
          return;
        }

        // Retrieve checkout data from server
        const checkoutRes = await fetch(`/api/get-checkout-data?sessionToken=${sessionToken}`);
        const checkoutData = await checkoutRes.json();
        
        console.log('📋 Retrieved checkout data:', checkoutData);

        if (!checkoutData.cartItems || checkoutData.cartItems.length === 0) {
          setError('No cart items found.');
          setLoading(false);
          return;
        }

        // Prevent duplicate order creation
        orderCreatedRef.current = true;
        
        // Call /api/create-order with server-side data
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: checkoutData.cartItems,
            shippingAddress: checkoutData.shippingAddress,
            email: checkoutData.email || session.customer_email,
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
        console.error('❌ Error in success page:', err);
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