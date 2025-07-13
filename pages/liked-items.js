import { useState, useEffect } from 'react';
import { useLikes } from '../lib/LikesContext';
import ProductCard from '../components/ProductCard';

export default function LikedItems() {
  const { likedProductIds } = useLikes();
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear invalid localStorage data on mount
  useEffect(() => {
    const storedLikes = localStorage.getItem('liked_products');
    if (storedLikes) {
      try {
        const parsed = JSON.parse(storedLikes);
        const validLikes = parsed.filter(id => id && id !== 'null' && id !== 'undefined');
        if (validLikes.length !== parsed.length) {
          localStorage.setItem('liked_products', JSON.stringify(validLikes));
          console.log('Cleaned invalid likes from localStorage');
        }
      } catch (err) {
        console.error('Error parsing localStorage likes:', err);
        localStorage.removeItem('liked_products');
      }
    }
  }, []);

  useEffect(() => {
    const fetchLikedProducts = async () => {
      if (likedProductIds.length === 0) {
        setLikedProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching products for IDs:', likedProductIds);
        // Filter out null/undefined values
        const validIds = likedProductIds.filter(id => id && id !== 'null' && id !== 'undefined');
        console.log('Valid product IDs:', validIds);
        
        const promises = validIds.map(async (id) => {
          const response = await fetch(`/api/products/${id}`);
          if (!response.ok) {
            console.error(`Failed to fetch product ${id}:`, response.status, response.statusText);
            return null;
          }
          return response.json();
        });
        const products = await Promise.all(promises);
        const validProducts = products.filter(product => product && product.id);
        console.log('Fetched products:', validProducts);
        setLikedProducts(validProducts);
      } catch (err) {
        console.error('Error fetching liked products:', err);
        setError('Failed to load liked products');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedProducts();
  }, [likedProductIds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
            <p className="mt-4 text-pink-400 text-lg">Loading your liked items...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-red-400 text-2xl font-bold mb-4">Error</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition-colors shadow-neon-pink"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4">
            Liked Items
          </h1>
          <p className="text-gray-300 text-lg">
            Your favorite products from NEXUS
          </p>
        </div>

        {likedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-pink-400 text-8xl mb-6">💔</div>
            <h2 className="text-2xl font-bold text-pink-400 mb-4">No Liked Items</h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Start exploring our products and like the ones you love. They'll appear here for easy access.
            </p>
            <a 
              href="/products"
              className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 shadow-neon-pink hover:shadow-neon-pink-lg transform hover:scale-105"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-pink-400 text-lg">
                {likedProducts.length} {likedProducts.length === 1 ? 'item' : 'items'} liked
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {likedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 