import { useState } from 'react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.product_id}`}>
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-xl bg-gray-200">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="h-48 w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900">{product.product_name}</h3>
          <p className="mt-1 text-sm text-gray-500">{product.product_description}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-bold text-indigo-600">${product.product_price}</p>
            <button 
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-300 ${
                isHovered ? 'bg-indigo-700' : 'bg-indigo-600'
              }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
