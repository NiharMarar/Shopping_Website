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
  
  // New shipping state
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [taxRate, setTaxRate] = useState(0.08); // Default 8% tax rate

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

  // Check if cart is empty and redirect if needed
  useEffect(() => {
    if (!loading && cartItems.length === 0) {
      console.log('🛒 Cart is empty, redirecting to home...');
      router.push('/');
    }
  }, [cartItems, loading, router]);

  // Sync billing address with shipping if checkbox is checked
  useEffect(() => {
    if (billingSameAsShipping) {
      setBillingAddress({ ...shippingAddress });
    }
  }, [billingSameAsShipping, shippingAddress]);

  // Calculate shipping rates when address changes
  useEffect(() => {
    if (shippingAddress.line1 && shippingAddress.city && shippingAddress.state && shippingAddress.postal_code && cartItems.length > 0) {
      calculateShippingRates();
    }
  }, [shippingAddress, cartItems]);

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

  const calculateShippingRates = async () => {
    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
      console.log('❌ Missing address fields for shipping calculation');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      console.log('❌ No cart items for shipping calculation');
      return;
    }

    setCalculatingShipping(true);
    try {
      console.log('🚢 Calculating shipping rates for:', {
        address: shippingAddress,
        cartItemsCount: cartItems.length
      });

      const response = await fetch('/api/domestic-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            name: shippingAddress.name,
            street1: shippingAddress.line1,
            street2: shippingAddress.line2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.postal_code,
            country: shippingAddress.country,
          },
          cartItems
        })
      });

      const data = await response.json();
      console.log('🚢 Shipping rates response:', data);

      if (data.success && data.rates && data.rates.length > 0) {
        setShippingRates(data.rates);
        // Auto-select the cheapest rate
        const cheapestRate = data.rates.reduce((min, rate) => 
          parseFloat(rate.rate) < parseFloat(min.rate) ? rate : min
        );
        setSelectedShippingRate(cheapestRate);
        console.log('✅ Shipping rates calculated, selected:', cheapestRate);
      } else {
        console.error('❌ Failed to get shipping rates:', data.error || 'No rates returned');
        setShippingRates([]);
        setSelectedShippingRate(null);
      }
    } catch (error) {
      console.error('❌ Error calculating shipping rates:', error);
      setShippingRates([]);
      setSelectedShippingRate(null);
    } finally {
      setCalculatingShipping(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // Handle both logged-in user and guest cart item structures
      const price = item.products?.product_price || item.product?.product_price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const calculateShipping = () => {
    return selectedShippingRate ? parseFloat(selectedShippingRate.rate) : 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    return (subtotal + shipping) * taxRate;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const tax = calculateTax();
    return subtotal + shipping + tax;
  };

  // Address validation helper
  function validateAddress(address, label = 'Address') {
    if (!address) return `${label} is required.`;
    if (!address.name) return `${label}: Full Name is required.`;
    if (!address.line1) return `${label}: Address Line 1 is required.`;
    if (!address.city) return `${label}: City is required.`;
    if (!address.state) return `${label}: State is required.`;
    if (!address.postal_code) return `${label}: Postal Code is required.`;
    if (!address.country) return `${label}: Country is required.`;
    return null;
  }

  function validateEmail(email) {
    if (!email) return 'Email is required.';
    // Simple email regex
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email address.';
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate addresses and email (basic client-side)
    const shippingError = validateAddress(shippingAddress, 'Shipping address');
    const billingError = !billingSameAsShipping ? validateAddress(billingAddress, 'Billing address') : null;
    const emailError = validateEmail(email);
    if (shippingError || billingError || emailError) {
      setError(shippingError || billingError || emailError);
      setLoading(false);
      return;
    }

    // Validate shipping rate is selected
    if (!selectedShippingRate) {
      setError('Please select a shipping option.');
      setLoading(false);
      return;
    }

    // --- Shippo address validation ---
    try {
      const res = await fetch('/api/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: {
          name: shippingAddress.name,
          street1: shippingAddress.line1,
          street2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.postal_code,
          country: shippingAddress.country,
          email: email,
        } }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.data.validation_results?.is_valid === false) {
        setError('Shipping address is invalid. Please check your address and try again.');
        setLoading(false);
        return;
      }
    } catch (err) {
      setError('Error validating address. Please try again.');
      setLoading(false);
      return;
    }
    // --- End Shippo address validation ---

    try {
      if (!cartItems || cartItems.length === 0) {
        setError('Your cart is empty.');
        setLoading(false);
        return;
      }
      
      console.log('Submitting checkout with email:', email);
      console.log('Cart items for checkout:', cartItems);
      
      // Store checkout data in localStorage for success page
      const checkoutData = {
        cartItems,
        shippingAddress,
        billingAddress,
        email,
        selectedShippingRate,
        taxRate
      };
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      // Create Stripe checkout session with shipping and tax
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
          selectedShippingRate,
          taxRate,
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
      setError(error.message);
    } finally {
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

                {/* Shipping Options */}
                {shippingRates.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Options</h3>
                    <div className="space-y-2">
                      {shippingRates.map((rate, index) => (
                        <label key={index} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="shipping"
                            value={index}
                            checked={selectedShippingRate === rate}
                            onChange={() => setSelectedShippingRate(rate)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{rate.servicelevel.name}</div>
                            <div className="text-sm text-gray-500">{rate.estimated_days} days</div>
                          </div>
                          <div className="font-medium">${parseFloat(rate.rate).toFixed(2)}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {calculatingShipping && (
                  <div className="mt-4 text-center text-gray-600">
                    Calculating shipping rates...
                  </div>
                )}

                {/* Billing Address Section */}
                <div className="mt-8">
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={e => setBillingSameAsShipping(e.target.checked)}
                      className="mr-2"
                    />
                    Billing address same as shipping address
                  </label>

                  {!billingSameAsShipping && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
                      {/* Billing address fields - same structure as shipping */}
                      <div>
                        <label htmlFor="billing_name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="billing_name"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={billingAddress.name}
                          onChange={(e) => setBillingAddress({ ...billingAddress, name: e.target.value })}
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={billingAddress.line1}
                          onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="billing_line2" className="block text-sm font-medium text-gray-700">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          id="billing_line2"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={billingAddress.line2}
                          onChange={(e) => setBillingAddress({ ...billingAddress, line2: e.target.value })}
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={billingAddress.state}
                            onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={billingAddress.postal_code}
                            onChange={(e) => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
                          />
                        </div>

                        <div>
                          <label htmlFor="billing_country" className="block text-sm font-medium text-gray-700">
                            Country
                          </label>
                          <select
                            id="billing_country"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={billingAddress.country}
                            onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !selectedShippingRate}
                    className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => {
                  const price = item.products?.product_price || item.product?.product_price || item.price || 0;
                  const quantity = item.quantity || 1;
                  const total = price * quantity;
                  
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.products?.image_url || item.product?.image_url || '/placeholder.png'}
                        alt={item.products?.product_name || item.product?.product_name || 'Product'}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.products?.product_name || item.product?.product_name || 'Product'}</h3>
                        <p className="text-sm text-gray-500">Qty: {quantity}</p>
                      </div>
                      <p className="font-medium">${total.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {selectedShippingRate && (
                  <div className="flex justify-between">
                    <span>Shipping ({selectedShippingRate.servicelevel.name}):</span>
                    <span>${calculateShipping().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 