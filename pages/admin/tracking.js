import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export default function AdminTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState({
    tracking_number: '',
    tracking_carrier: 'USPS',
    order_status: 'shipped'
  });

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.email === 'admin@yourshop.com' || user?.email === 'mararnihar@gmail.com';

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders();
    }
  }, [user, isAdmin]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          order_number,
          order_status,
          tracking_number,
          tracking_carrier,
          total_amount,
          created_at,
          shipped_at,
          delivered_at,
          email,
          shipping_address,
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async (orderId) => {
    if (!trackingData.tracking_number.trim()) {
      alert('Please enter a tracking number');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        tracking_number: trackingData.tracking_number.trim(),
        tracking_carrier: trackingData.tracking_carrier,
        order_status: trackingData.order_status
      };

      // Add timestamps based on status
      if (trackingData.order_status === 'shipped' && !selectedOrder.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      }
      if (trackingData.order_status === 'delivered' && !selectedOrder.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('order_id', orderId);

      if (error) throw error;

      // Send tracking email notification
      await sendTrackingEmail(selectedOrder, updateData);

      alert('Tracking information updated successfully!');
      setSelectedOrder(null);
      setTrackingData({ tracking_number: '', tracking_carrier: 'USPS', order_status: 'shipped' });
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating tracking:', error);
      alert('Error updating tracking information');
    } finally {
      setUpdating(false);
    }
  };

  const sendTrackingEmail = async (order, trackingData) => {
    try {
      const response = await fetch('/api/send-tracking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.order_id,
          trackingNumber: trackingData.tracking_number,
          trackingCarrier: trackingData.tracking_carrier,
          orderStatus: trackingData.order_status,
          customerEmail: order.email
        })
      });

      if (!response.ok) {
        console.error('Failed to send tracking email');
      }
    } catch (error) {
      console.error('Error sending tracking email:', error);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Please log in to access admin features.</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Access denied. Admin privileges required.</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - Order Tracking</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Tracking Management</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.order_id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Customer: {order.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        ${order.total_amount}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
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
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Tracking Info */}
                  {order.tracking_number && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Current Tracking:</h4>
                      <p className="text-sm text-gray-600">
                        {order.tracking_carrier}: {order.tracking_number}
                      </p>
                      {order.shipped_at && (
                        <p className="text-xs text-gray-500">
                          Shipped: {new Date(order.shipped_at).toLocaleDateString()}
                        </p>
                      )}
                      {order.delivered_at && (
                        <p className="text-xs text-gray-500">
                          Delivered: {new Date(order.delivered_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Update Tracking Form */}
                  <div className="border-t pt-4">
                    {selectedOrder?.order_id === order.order_id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tracking Number
                            </label>
                            <input
                              type="text"
                              value={trackingData.tracking_number}
                              onChange={(e) => setTrackingData({...trackingData, tracking_number: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter tracking number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Carrier
                            </label>
                            <select
                              value={trackingData.tracking_carrier}
                              onChange={(e) => setTrackingData({...trackingData, tracking_carrier: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="USPS">USPS</option>
                              <option value="FedEx">FedEx</option>
                              <option value="UPS">UPS</option>
                              <option value="DHL">DHL</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={trackingData.order_status}
                              onChange={(e) => setTrackingData({...trackingData, order_status: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleUpdateTracking(order.order_id)}
                            disabled={updating}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                          >
                            {updating ? 'Updating...' : 'Update Tracking'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(null);
                              setTrackingData({ tracking_number: '', tracking_carrier: 'USPS', order_status: 'shipped' });
                            }}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingData({
                            tracking_number: order.tracking_number || '',
                            tracking_carrier: order.tracking_carrier || 'USPS',
                            order_status: order.order_status || 'shipped'
                          });
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        {order.tracking_number ? 'Update Tracking' : 'Add Tracking'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 