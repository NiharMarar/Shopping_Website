import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      // Clear the cart after successful payment
      clearCart();
      
      // You can fetch order details here if needed
      // For now, we'll just show a success message
      setLoading(false);
    }
  }, [session_id, clearCart]);

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

          {session_id && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Order Details</h2>
              <p className="text-sm text-gray-600">
                Session ID: <span className="font-mono">{session_id}</span>
              </p>
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
                onClick={() => router.push('/profile')}
                className="ml-4 inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View Orders
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
} 