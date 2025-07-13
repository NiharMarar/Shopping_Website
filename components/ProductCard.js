import { useState } from 'react';
import Link from 'next/link';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useLikes } from '../lib/LikesContext';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { isLiked, likeProduct, unlikeProduct } = useLikes();
  const liked = isLiked(product.product_id);

  const handleLike = (e) => {
    e.preventDefault();
    setLiked((prev) => !prev);
    // TODO: Add logic for localStorage/Supabase here
  };

  return (
    <div 
      className="group relative bg-cyberpunk-surface rounded-xl shadow-neon overflow-hidden transition-all duration-300 hover:shadow-xl border border-cyberpunk-neonBlue"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.product_id}`}>
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-xl bg-gray-200 relative">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="h-48 w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
          />
          {/* Heart icon button */}
                      <button
              onClick={() => liked ? unlikeProduct(product.product_id) : likeProduct(product.product_id)}
              aria-label={liked ? 'Unlike' : 'Like'}
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/60 hover:bg-pink-500/80 transition-colors border-2 border-pink-400 shadow-neon-pink"
            >
            {liked ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="#ff3cac" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ff3cac" className="w-6 h-6 drop-shadow-neon-pink">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 00-7.6 0l-.835.836-.835-.836a5.373 5.373 0 00-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 000-7.6z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ff3cac" className="w-6 h-6 drop-shadow-neon-pink">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 00-7.6 0l-.835.836-.835-.836a5.373 5.373 0 00-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 000-7.6z" />
              </svg>
            )}
          </button>
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
