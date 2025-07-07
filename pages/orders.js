import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch user's orders (only for logged-in users)
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (user) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('orders')
            .select(`
              order_id,
              order_number,
              order_status,
              tracking_number,
              tracking_carrier,
              shipped_at,
              delivered_at,
              total_amount,
              created_at,
              order_items (
                quantity,
                unit_price,
                total_price,
                product:product_id (
                  product_name,
                  image_url
                )
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setOrders(data || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserOrders();
  }, [user]);

  // Search for order by order number (works for both guests and logged-in users)
  const searchOrder = async () => {
    if (!searchOrderNumber.trim()) return;

    setSearchLoading(true);
    setSearchResult(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          order_number,
          order_status,
          tracking_number,
          tracking_carrier,
          shipped_at,
          delivered_at,
          total_amount,
          created_at,
          order_items (
            quantity,
            unit_price,
            total_price,
            product:product_id (
              product_name,
              image_url
            )
          )
        `)
        .eq('order_number', searchOrderNumber.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setSearchResult({ error: 'Order not found' });
        } else {
          throw error;
        }
      } else {
        setSearchResult(data);
      }
    } catch (error) {
      console.error('Error searching order:', error);
      setSearchResult({ error: 'Error searching for order' });
    } finally {
      setSearchLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrackingUrl = (carrier, number) => {
    if (!carrier || !number) return null;
    
    switch (carrier.toUpperCase()) {
      case 'USPS':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${number}`;
      case 'FEDEX':
        return `https://www.fedex.com/fedextrack/?trknbr=${number}`;
      case 'UPS':
        return `https://www.ups.com/track?tracknum=${number}`;
      case 'DHL':
        return `https://www.dhl.com/en/express/tracking.html?AWB=${number}`;
      default:
        return `https://www.google.com/search?q=${carrier}+tracking+${number}`;
    }
  };

  const OrderCard = ({ order, title = "Order Details" }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {title} #{order.order_number}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-gray-900">
            ${order.total_amount}
          </p>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
            {order.order_status ? order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1) : 'Pending'}
          </span>
        </div>
      </div>

      {/* Tracking Information */}
      {order.tracking_number && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Tracking Information</h4>
          <div className="space-y-1">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Carrier:</span> {order.tracking_carrier || 'USPS'}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Tracking Number:</span> 
              <span className="font-mono ml-1">{order.tracking_number}</span>
            </p>
            {order.shipped_at && (
              <p className="text-xs text-blue-600">
                Shipped: {new Date(order.shipped_at).toLocaleDateString()}
              </p>
            )}
            {order.delivered_at && (
              <p className="text-xs text-blue-600">
                Delivered: {new Date(order.delivered_at).toLocaleDateString()}
              </p>
            )}
            {getTrackingUrl(order.tracking_carrier, order.tracking_number) && (
              <a
                href={getTrackingUrl(order.tracking_carrier, order.tracking_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Track Package
              </a>
            )}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Items:</h4>
        <div className="space-y-2">
          {order.order_items.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <img
                src={item.product.image_url}
                alt={item.product.product_name}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {item.product.product_name}
                </p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × ${item.unit_price}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ${item.total_price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Orders - Your Shop</title>
        <meta name="description" content="Search and view your orders" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders</h1>

        {/* Search Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Order</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter your order number to find your order details
          </p>
          
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Enter order number (e.g., ORD-1234567890-123)"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchOrder}
              disabled={searchLoading || !searchOrderNumber.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResult && (
            <div className="mt-6">
              {searchResult.error ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{searchResult.error}</p>
                </div>
              ) : (
                <OrderCard order={searchResult} title="Found Order" />
              )}
            </div>
          )}
        </div>

        {/* User's Orders (only for logged-in users) */}
        {user && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-900">No orders yet</h3>
                <p className="mt-2 text-gray-500">Start shopping to see your orders here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <OrderCard key={order.order_id} order={order} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Guest message */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Not logged in?</h3>
            <p className="text-blue-700">
              You can still search for your orders using your order number above. 
              If you create an account, you'll be able to see all your orders in one place.
            </p>
          </div>
        )}
      </main>
    </>
  );
}