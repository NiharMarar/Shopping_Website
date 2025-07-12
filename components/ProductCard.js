import { useState } from 'react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative bg-cyberpunk-surface rounded-xl shadow-neon overflow-hidden transition-all duration-300 hover:shadow-xl border border-cyberpunk-neonBlue"
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
          <h3 className="text-lg font-nexus font-bold text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7]">{product.product_name}</h3>
          <p className="mt-1 text-sm text-cyberpunk-neonPurple">{product.product_description}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-extrabold text-cyberpunk-neonPink drop-shadow-[0_0_8px_#ff00cb]">${product.product_price}</p>
            <button 
              className={`px-4 py-2 rounded-md font-nexus font-bold transition-colors duration-300 shadow-neon border border-cyberpunk-neonPink focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonBlue focus:ring-offset-2 ${isHovered ? 'bg-cyberpunk-neonPink text-cyberpunk-bg' : 'bg-cyberpunk-neonBlue text-cyberpunk-bg hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg'}`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
