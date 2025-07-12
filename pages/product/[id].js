import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCart } from '../../lib/CartContext';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart, showToast } = useCart();

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching product:', error);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast('Added to cart');
  };

  if (isLoading) {
    return (
      <>
        <div className="flex justify-center items-center h-64 bg-cyberpunk-bg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyberpunk-neonBlue"></div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <div className="text-center py-12 bg-cyberpunk-bg min-h-screen">
          <h1 className="text-2xl font-nexus font-bold text-cyberpunk-neonPink">Product not found</h1>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-cyberpunk-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-cyberpunk-surface rounded-xl shadow-neon p-8 border border-cyberpunk-neonBlue">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product image */}
          <div className="flex flex-col items-center justify-center">
            <img
              src={product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
              alt={product.product_name}
              className="w-full max-w-xs rounded-lg border-2 border-cyberpunk-neonBlue shadow-neon mb-4 bg-cyberpunk-bg object-cover"
            />
          </div>
          {/* Product details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-nexus font-bold text-cyberpunk-neonBlue mb-4 drop-shadow-[0_0_8px_#00ffe7]">{product.product_name}</h1>
            <p className="text-cyberpunk-neonPurple mb-4">{product.product_description}</p>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-nexus font-extrabold text-cyberpunk-neonPink drop-shadow-[0_0_8px_#ff00cb]">${product.product_price}</span>
              <label htmlFor="quantity" className="mr-2 text-cyberpunk-neonBlue font-nexus font-bold">Qty:</label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="rounded-md border-cyberpunk-neonBlue py-1.5 px-3 bg-cyberpunk-bg text-cyberpunk-neonBlue font-nexus font-bold shadow-neon focus:border-cyberpunk-neonPink focus:ring-cyberpunk-neonPink transition-colors"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <button
                onClick={handleAddToCart}
                className="px-6 py-2 bg-cyberpunk-neonBlue text-cyberpunk-bg rounded font-nexus font-bold hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg shadow-neon border border-cyberpunk-neonPink transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 