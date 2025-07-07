import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  });
  const [email, setEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  // Diagnostic log
  console.log('Checkout render: user =', user, 'loading =', loading);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      // Guest: load from localStorage (support both 'cartItems' and 'cart')
      let stored = localStorage.getItem('cartItems');
      if (!stored) {
        stored = localStorage.getItem('cart');
      }
      if (stored) {
        try {
          setCartItems(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing stored cart items:', e);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      setLoading(false);
    }
  }, [user]);

  // Sync billing address with shipping if checkbox is checked
  useEffect(() => {
    if (billingSameAsShipping) {
      setBillingAddress({ ...shippingAddress });
    }
  }, [billingSameAsShipping, shippingAddress]);

  const fetchCartItems = async () => {
    try {
      console.log('🔍 Fetching cart for user:', user.id);
      // First, get the user's cart
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('cart_id')
        .eq('user_id', user.id)
        .single();

      console.log('📦 Cart query result:', { cart, cartError });

      if (cartError) throw cartError;
      if (!cart) {
        console.log('❌ No cart found for user');
        setCartItems([]);
        setLoading(false);
        return;
      }

      console.log('🛒 Found cart_id:', cart.cart_id);
      // Then, get the cart items with product info
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('cart_id', cart.cart_id);

      console.log('📋 Cart items query result:', { data, error });

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Handle both logged-in user and guest cart item structures
      const price = item.products?.product_price || item.product?.product_price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!cartItems || cartItems.length === 0) {
        setError('Your cart is empty.');
        setLoading(false);
        return;
      }
      
      console.log('Submitting checkout with email:', email);
      console.log('Cart items for checkout:', cartItems);
      
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          shippingAddress,
          billingAddress,
          email,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cart`,
        }),
      });
      
      const { sessionId } = await response.json();
      
      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId
      });
      
      if (stripeError) throw stripeError;
    } catch (error) {
      console.error('❌ Checkout error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    console.log('Checkout: loading...');
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  console.log('Checkout: rendering form');

  return (
    <>
      <Head>
        <title>Checkout - YourShop</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="line1" className="block text-sm font-medium text-gray-700">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      id="line1"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={shippingAddress.line1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="line2" className="block text-sm font-medium text-gray-700">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id="line2"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={shippingAddress.line2}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postal_code"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={shippingAddress.postal_code}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <select
                        id="country"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        console.log('Email input changed:', e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* Billing Address Section */}
                <div className="mt-8">
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={e => setBillingSameAsShipping(e.target.checked)}
                      className="mr-2"
                    />
                    Billing address is the same as shipping address
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="billing_name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="billing_name"
                        required
                        disabled={billingSameAsShipping}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={billingAddress.name}
                        onChange={e => setBillingAddress({ ...billingAddress, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="billing_line1" className="block text-sm font-medium text-gray-700">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        id="billing_line1"
                        required
                        disabled={billingSameAsShipping}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={billingAddress.line1}
                        onChange={e => setBillingAddress({ ...billingAddress, line1: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="billing_line2" className="block text-sm font-medium text-gray-700">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        id="billing_line2"
                        disabled={billingSameAsShipping}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={billingAddress.line2}
                        onChange={e => setBillingAddress({ ...billingAddress, line2: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billing_city" className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          id="billing_city"
                          required
                          disabled={billingSameAsShipping}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={billingAddress.city}
                          onChange={e => setBillingAddress({ ...billingAddress, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="billing_state" className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          id="billing_state"
                          required
                          disabled={billingSameAsShipping}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={billingAddress.state}
                          onChange={e => setBillingAddress({ ...billingAddress, state: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billing_postal_code" className="block text-sm font-medium text-gray-700">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          id="billing_postal_code"
                          required
                          disabled={billingSameAsShipping}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={billingAddress.postal_code}
                          onChange={e => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="billing_country" className="block text-sm font-medium text-gray-700">
                          Country
                        </label>
                        <select
                          id="billing_country"
                          required
                          disabled={billingSameAsShipping}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={billingAddress.country}
                          onChange={e => setBillingAddress({ ...billingAddress, country: e.target.value })}
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item, index) => {
                  // Handle both logged-in user and guest cart item structures
                  const productName = item.products?.product_name || item.product?.product_name || item.name || 'Unknown Product';
                  const productPrice = item.products?.product_price || item.product?.product_price || item.price || 0;
                  const productImage = item.products?.image_url || item.product?.image_url || item.image || '';
                  const quantity = item.quantity || 1;
                  const itemTotal = productPrice * quantity;
                  
                  // Create a unique key
                  const uniqueKey = item.cart_item_id || item.id || `item-${index}-${productName}`;
                  
                  return (
                    <div key={uniqueKey} className="flex items-center space-x-4">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{productName}</h3>
                        <p className="text-sm text-gray-500">Quantity: {quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        ${itemTotal.toFixed(2)}
                      </p>
                    </div>
                  );
                })}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 