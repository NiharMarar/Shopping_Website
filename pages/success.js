import { useEffect, useState } from 'react';
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
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("🚨 session_id from router.query:", session_id);

  useEffect(() => {
    const createOrder = async () => {
      console.log("🚨 useEffect running", { session_id, loading, cartItems });
      if (session_id && loading) {
        try {
          // Store cart items before clearing them
          const itemsToOrder = [...cartItems];
          
          console.log('Creating order with session_id:', session_id);
          console.log('Cart items:', itemsToOrder);
          console.log('User:', user);

          // Create order in database
          console.log("🚨 About to call /api/create-order");
          const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: session_id,
              cartItems: itemsToOrder,
              user
            }),
          });

          const result = await response.json();
          console.log('Order creation result:', result);

          if (result.success) {
            setOrderDetails({
              orderId: result.orderId,
              orderNumber: result.orderNumber,
              sessionId: session_id // <-- use the variable from router.query
            });
          } else {
            setError(result.error || 'Failed to create order');
          }
        } catch (err) {
          console.error('Error creating order:', err);
          setError('Error processing order: ' + err.message);
        } finally {
          // Clear cart and stop loading
          clearCart();
          setLoading(false);
        }
      }
    };

    createOrder();
  }, [session_id, loading, user, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Processing Error</h1>
          <p className="text-lg text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push('/cart')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Order Successful - Your Shop</title>
        <meta name="description" content="Your order has been placed successfully" />
      </Head>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank you for your order!
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Your payment has been processed successfully. You will receive an email confirmation shortly.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Order Number:</span> <span className="font-mono">{orderDetails.orderNumber}</span></p>
                <p><span className="font-medium">Session ID:</span> <span className="font-mono">{orderDetails.sessionId}</span></p>
                <p><span className="font-medium">Total Items:</span> {cartItems?.length || 0}</p>
                <p><span className="font-medium">Total Amount:</span> ${(cartItems?.reduce((total, item) => total + (item.product.product_price * item.quantity), 0) || 0).toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Continue Shopping
            </button>

            {user && (
              <button
                onClick={() => router.push('/orders')}
                className="ml-4 inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View My Orders
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}