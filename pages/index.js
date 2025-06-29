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
    <div>
      <h1>Welcome to your shop</h1>
      <p>Discover our amazing products</p>
      {isLoading ? (
        <div>Loading products...</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(product => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
