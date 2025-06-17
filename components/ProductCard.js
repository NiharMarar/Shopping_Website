export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <img src={product.image} alt={product.name} className="h-48 w-full object-cover rounded" />
      <h2 className="mt-4 font-semibold">{product.name}</h2>
      <p className="text-indigo-600 font-bold">{product.price}</p>
      <button className="mt-4 w-full py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
        Add to Cart
      </button>
    </div>
  );
}
