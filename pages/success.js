import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import { useCart } from '../lib/CartContext';
import { supabase } from '../lib/supabaseClient';

console.log("🚨 Success page loaded");

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const orderCreatedRef = useRef(false);
  const processingRef = useRef(false);
  const cartClearedRef = useRef(false);

  // Clear cart function for both logged-in and guest users
  const clearCartAndStorage = async () => {
    if (cartClearedRef.current) {
      console.log('🔄 Cart already cleared, skipping...');
      return;
    }
    
    try {
      // Use the cart context's clearCart function to update the UI
      await clearCart();
      
      // Also clear localStorage for guest users as backup
      if (!user) {
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cart');
      }
      
      cartClearedRef.current = true;
      console.log('✅ Cart cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
    }
  };

  useEffect(() => {
    async function handleSuccess() {
      if (!session_id || orderCreatedRef.current || processingRef.current) {
        console.log('🔄 Skipping order processing:', {
          hasSessionId: !!session_id,
          orderCreated: orderCreatedRef.current,
          processing: processingRef.current
        });
        return;
      }

      processingRef.current = true;
      setLoading(true);

      try {
        // First, try to find existing order by session_id to prevent duplicates
        console.log('🔍 Checking for existing order with session_id:', session_id);
        const existingOrderRes = await fetch(`/api/get-order-by-session?session_id=${session_id}`);
        const existingOrder = await existingOrderRes.json();
        
        if (existingOrder.success) {
          console.log('✅ Found existing order, loading details...');
          setOrder(existingOrder.order);
          setOrderCreated(true);
          await clearCartAndStorage();
          setLoading(false);
          return;
        }

        // If no existing order, proceed with order creation
        console.log('📝 No existing order found, creating new order...');
        
        // Get checkout data from localStorage
        const checkoutData = JSON.parse(localStorage.getItem('checkoutData') || '{}');
        
        if (!checkoutData.cartItems || checkoutData.cartItems.length === 0) {
          console.log('❌ No checkout data found in localStorage');
          setError('No checkout data found. Please contact support with your session ID: ' + session_id);
          setLoading(false);
          return;
        }

        // Call /api/create-order with server-side data
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: checkoutData.cartItems,
            shippingAddress: checkoutData.shippingAddress,
            billingAddress: checkoutData.billingAddress,
            email: checkoutData.email,
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
        
        // Fetch the created order details
        const orderDetailsRes = await fetch(`/api/get-order-details?orderId=${orderData.orderId}`);
        const orderDetails = await orderDetailsRes.json();
        
        if (orderDetails.success) {
          setOrder(orderDetails.order);
        }
        
        setOrderCreated(true);
        await clearCartAndStorage();
        setLoading(false);
        
        // Clean up localStorage
        localStorage.removeItem('checkoutData');
        
      } catch (err) {
        console.error('❌ Error in success page:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    handleSuccess();
  }, [session_id, user]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Clear cart when leaving the success page
      if (!cartClearedRef.current) {
        clearCartAndStorage();
      }
    };

    const handlePopState = () => {
      // If user navigates away and comes back, ensure cart is cleared
      if (!cartClearedRef.current) {
        clearCartAndStorage();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing your order...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error}</p>
            <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Order Confirmation - YourShop</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="bg-white p-8 rounded-lg shadow text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you for your purchase!</h1>
            <p className="text-gray-600">Your order has been placed successfully and payment has been processed.</p>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important: Save This Information</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please take a screenshot or write down your order details below. This is your proof of purchase.</p>
                  <p className="mt-1">You should also receive a confirmation email shortly. If you don't receive it, check your spam folder.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              </div>
              
              <div className="p-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Order Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Order Number:</span> <span className="font-mono text-blue-600">{order.order_number}</span></p>
                      <p><span className="font-medium">Order Date:</span> {new Date(order.created_at).toLocaleString()}</p>
                      <p><span className="font-medium">Total Amount:</span> <span className="font-semibold">${order.total_amount}</span></p>
                      <p><span className="font-medium">Status:</span> <span className="capitalize">{order.order_status || 'pending'}</span></p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-600">
                      {order.shipping_address && (
                        <>
                          <p>{order.shipping_address.name}</p>
                          <p>{order.shipping_address.line1}</p>
                          {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                          <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                          <p>{order.shipping_address.country}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Items Ordered</h3>
                  <div className="space-y-4">
                    {order.order_items && order.order_items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={item.product?.image_url || '/placeholder.png'}
                          alt={item.product?.product_name || 'Product'}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product?.product_name || 'Product'}</h4>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">${item.total_price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Information (if available) */}
                {order.tracking_number && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Tracking Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Carrier:</span> {order.tracking_carrier || 'USPS'}</p>
                      <p><span className="font-medium">Tracking Number:</span> <span className="font-mono text-blue-600">{order.tracking_number}</span></p>
                      {order.shipped_at && (
                        <p><span className="font-medium">Shipped:</span> {new Date(order.shipped_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>• You'll receive a confirmation email shortly (check spam if you don't see it)</p>
                    <p>• We'll send you tracking information once your order ships</p>
                    <p>• You can track your order anytime at <Link href="/orders" className="text-blue-600 hover:underline">/orders</Link></p>
                    <p>• For questions, reply to your confirmation email with your order number</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 text-center space-x-4">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}