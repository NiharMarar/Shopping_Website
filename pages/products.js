import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabaseClient';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = '/api/products';
        if (router.query.category) {
          url += `?category=${router.query.category}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
        setSelectedCategory(router.query.category || '');
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [router.query.category]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name');
      if (!error) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value) {
      router.push(`/products?category=${value}`);
    } else {
      router.push('/products');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-10 p-6 bg-cyberpunk-surface rounded shadow-neon border border-cyberpunk-neonBlue min-h-[60vh] flex flex-col items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mb-4"></div>
        <p className="text-cyberpunk-neonPink text-lg">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto mt-10 p-6 bg-cyberpunk-surface rounded shadow-neon border border-cyberpunk-neonBlue min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition-colors shadow-neon-pink"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-cyberpunk-surface rounded shadow-neon border border-cyberpunk-neonBlue min-h-[60vh]">
      <h1 className="text-3xl font-nexus font-bold mb-8 text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7] text-center">Products</h1>
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full px-4 py-3 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-pink-400 text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-pink-400 mb-4">No Products Found</h2>
          <p className="text-cyberpunk-neonPurple mb-8 max-w-md mx-auto">
            There are currently no products available. Please check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.product_id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
} 