import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

const LikesContext = createContext();

export function LikesProvider({ children }) {
  const { user } = useAuth();
  const [likedProductIds, setLikedProductIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: fetch liked products from Supabase
  const fetchSupabaseLikes = async (userId) => {
    const { data, error } = await supabase
      .from('liked_items')
      .select('product_id')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching liked items:', error);
      return [];
    }
    return data.map(item => item.product_id);
  };

  // On mount or when user changes, load likes
  useEffect(() => {
    const loadLikes = async () => {
      setLoading(true);
      if (user) {
        // Sync guest likes to Supabase on login
        const guestLikes = JSON.parse(localStorage.getItem('liked_products') || '[]');
        if (guestLikes.length > 0) {
          // Insert any guest likes not already in Supabase
          const { data: existing } = await supabase
            .from('liked_items')
            .select('product_id')
            .eq('user_id', user.id);
          const existingIds = (existing || []).map(item => item.product_id);
          const newLikes = guestLikes.filter(pid => !existingIds.includes(pid));
          if (newLikes.length > 0) {
            await supabase.from('liked_items').insert(newLikes.map(pid => ({ user_id: user.id, product_id: pid })));
          }
          localStorage.removeItem('liked_products');
        }
        // Load likes from Supabase
        setLikedProductIds(await fetchSupabaseLikes(user.id));
      } else {
        // Guest: load from localStorage
        setLikedProductIds(JSON.parse(localStorage.getItem('liked_products') || '[]'));
      }
      setLoading(false);
    };
    loadLikes();
  }, [user]);

  // Like a product
  async function likeProduct(productId) {
    if (user) {
      await supabase.from('liked_items').insert([{ user_id: user.id, product_id: productId }]);
      setLikedProductIds(prev => [...new Set([...prev, productId])]);
    } else {
      setLikedProductIds(prev => {
        const updated = [...new Set([...prev, productId])];
        localStorage.setItem('liked_products', JSON.stringify(updated));
        return updated;
      });
    }
  }

  // Unlike a product
  async function unlikeProduct(productId) {
    if (user) {
      await supabase.from('liked_items').delete().eq('user_id', user.id).eq('product_id', productId);
      setLikedProductIds(prev => prev.filter(pid => pid !== productId));
    } else {
      setLikedProductIds(prev => {
        const updated = prev.filter(pid => pid !== productId);
        localStorage.setItem('liked_products', JSON.stringify(updated));
        return updated;
      });
    }
  }

  // Check if a product is liked
  function isLiked(productId) {
    return likedProductIds.includes(productId);
  }

  return (
    <LikesContext.Provider value={{ likedProductIds, likeProduct, unlikeProduct, isLiked, loading }}>
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  return useContext(LikesContext);
} 