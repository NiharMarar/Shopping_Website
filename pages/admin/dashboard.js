import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    product_description: '',
    product_price: '',
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setMessage('Session expired. Please login again.');
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Product added successfully!');
        setFormData({
          product_id: '',
          product_name: '',
          product_description: '',
          product_price: '',
          image_url: ''
        });
        setShowAddForm(false);
        fetchProducts(); // Refresh the list
      } else {
        setMessage(data.message || 'Failed to add product');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
          <p className="mt-4 text-pink-400 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                ADMIN DASHBOARD
              </h1>
              <p className="text-cyberpunk-neonPurple mt-2">NEXUS Control Center</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-nexus font-bold rounded-lg transition-colors shadow-neon"
            >
              LOGOUT
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.includes('successfully') 
                ? 'bg-green-900/50 border-green-500 text-green-400' 
                : 'bg-red-900/50 border-red-500 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {/* Add Product Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-nexus font-bold rounded-lg transition-all duration-300 shadow-neon-pink hover:shadow-neon-pink-lg transform hover:scale-105"
            >
              {showAddForm ? 'CANCEL' : '+ ADD PRODUCT'}
            </button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <div className="mb-8 bg-cyberpunk-surface rounded-xl shadow-neon border border-cyberpunk-neonBlue p-6">
              <h2 className="text-2xl font-bold text-cyberpunk-neonBlue mb-6">Add New Product</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-nexus font-bold text-cyberpunk-neonBlue mb-2">
                    Product ID (Optional - Auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                    className="w-full px-4 py-3 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
                    placeholder="Leave empty for auto-generated UUID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-nexus font-bold text-cyberpunk-neonBlue mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                    className="w-full px-4 py-3 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
                    placeholder="e.g., Neon Cyber Visor"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-nexus font-bold text-cyberpunk-neonBlue mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.product_description}
                    onChange={(e) => setFormData({...formData, product_description: e.target.value})}
                    className="w-full px-4 py-3 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
                    placeholder="Product description..."
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-nexus font-bold text-cyberpunk-neonBlue mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.product_price}
                    onChange={(e) => setFormData({...formData, product_price: e.target.value})}
                    className="w-full px-4 py-3 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
                    placeholder="299.99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-nexus font-bold text-cyberpunk-neonBlue mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-4 py-3 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-nexus font-bold rounded-lg transition-all duration-300 shadow-neon disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'ADDING...' : 'ADD PRODUCT'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products List */}
          <div className="bg-cyberpunk-surface rounded-xl shadow-neon border border-cyberpunk-neonBlue p-6">
            <h2 className="text-2xl font-bold text-cyberpunk-neonBlue mb-6">Current Products ({products.length})</h2>
            
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-cyberpunk-neonPurple">No products found. Add your first product above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.product_id} className="bg-cyberpunk-bg rounded-lg border border-cyberpunk-neonBlue p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-nexus font-bold text-cyberpunk-neonBlue">{product.product_name}</h3>
                      <span className="text-cyberpunk-neonPink font-bold">${product.product_price}</span>
                    </div>
                    <p className="text-cyberpunk-neonPurple text-sm mb-3 line-clamp-2">{product.product_description}</p>
                    <div className="text-xs text-cyberpunk-neonPurple">
                      ID: {product.product_id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
} 