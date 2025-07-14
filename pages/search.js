import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProductCard from '../components/ProductCard';

export default function Search() {
  const router = useRouter();
  const { q } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError('Failed to load search results.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-cyberpunk-surface rounded shadow-neon border border-cyberpunk-neonBlue min-h-[60vh]">
      <h1 className="text-3xl font-nexus font-bold mb-8 text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7] text-center">
        Search Results{q ? ` for "${q}"` : ''}
      </h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mb-4"></div>
          <p className="text-cyberpunk-neonPink text-lg">Searching...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition-colors shadow-neon-pink"
          >
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-pink-400 text-8xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-pink-400 mb-4">No Results Found</h2>
          <p className="text-cyberpunk-neonPurple mb-8 max-w-md mx-auto">
            No products matched your search. Try a different keyword!
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