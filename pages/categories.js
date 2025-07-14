import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, description');
        if (error) throw error;
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-10 p-6 bg-cyberpunk-surface rounded shadow-neon border border-cyberpunk-neonBlue min-h-[60vh] flex flex-col items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mb-4"></div>
        <p className="text-cyberpunk-neonPink text-lg">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto mt-10 p-6 bg-cyberpunk-surface rounded shadow-neon border border-cyberpunk-neonBlue min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition-colors shadow-neon-pink"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-cyberpunk-surface rounded shadow-neon border border-cyberpunk-neonBlue min-h-[60vh]">
      <h1 className="text-3xl font-nexus font-bold mb-8 text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7] text-center">Categories</h1>
      {categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-pink-400 text-8xl mb-6">📦</div>
          <h2 className="text-2xl font-bold text-pink-400 mb-4">No Categories Found</h2>
          <p className="text-cyberpunk-neonPurple mb-8 max-w-md mx-auto">
            There are currently no categories available. Please check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.id}`} className="block bg-cyberpunk-bg rounded-xl border border-cyberpunk-neonBlue shadow-neon p-6 hover:border-pink-400 hover:shadow-neon-pink transition-all duration-300">
              <h2 className="text-xl font-nexus font-bold text-cyberpunk-neonBlue mb-2 drop-shadow-[0_0_8px_#00ffe7]">{cat.name}</h2>
              <p className="text-cyberpunk-neonPurple text-sm">{cat.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 