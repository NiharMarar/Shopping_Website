import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-cyberpunk-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-nexus font-extrabold mb-4 text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7] text-center">Welcome to NEXUS</h1>
        <p className="text-cyberpunk-neonPurple text-center mb-8">Discover our amazing products in a futuristic cyberpunk marketplace.</p>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyberpunk-neonBlue mx-auto shadow-neon"></div>
            <span className="ml-4 text-cyberpunk-neonPurple font-nexus">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-nexus font-medium text-cyberpunk-neonPink">No products found</h2>
            <p className="mt-4 text-cyberpunk-neonPurple">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
