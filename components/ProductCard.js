import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`} className="group">
      <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
        <div className="relative w-full h-64">
          <Image
            src={product.image || 'https://via.placeholder.com/400x400'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900">
            ${product.price.toFixed(2)}
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              // Add to cart functionality will be implemented later
              console.log('Add to cart:', product.id);
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Add to cart
          </button>
        </div>
      </div>
    </Link>
  );
}
