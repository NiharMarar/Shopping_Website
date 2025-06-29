'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Toast from '../components/Toast';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [loading, setLoading] = useState(true);

  // Helper: get or create cart for user
  const getOrCreateCart = async (userId) => {
    let { data: cart, error } = await supabase
      .from('carts')
      .select('cart_id')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert([{ user_id: userId }])
        .select('cart_id')
        .single();
      
      if (createError) throw createError;
      return newCart;
    } else if (error) {
      throw error;
    }
    
    return cart;
  };

  // Helper: fetch cart items from Supabase
  const fetchSupabaseCart = async (userId) => {
    try {
      const cart = await getOrCreateCart(userId);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          product:products(product_id, image_url, created_at, product_name, product_description, product_price)
        `)
        .eq('cart_id', cart.cart_id);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  };

  // On mount or when user changes, load cart
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          const supaCart = await fetchSupabaseCart(user.id);
          setCartItems(supaCart);
        } else {
          const stored = localStorage.getItem('cart');
          setCartItems(stored ? JSON.parse(stored) : []);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
      }
      setLoading(false);
    };
    loadCart();
  }, [user]);

  // Sync guest cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Add to cart
  async function addToCart(product, quantity = 1) {
    if (user) {
      try {
        const cart = await getOrCreateCart(user.id);
        
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('quantity')
          .eq('cart_id', cart.cart_id)
          .eq('product_id', product.product_id)
          .single();

        if (existingItem) {
          await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('cart_id', cart.cart_id)
            .eq('product_id', product.product_id);
        } else {
          await supabase
            .from('cart_items')
            .insert([{
              cart_id: cart.cart_id,
              product_id: product.product_id,
              quantity: quantity
            }]);
        }

        const supaCart = await fetchSupabaseCart(user.id);
        setCartItems(supaCart);
      } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Error adding to cart');
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.product.product_id === product.product_id);
        if (existing) {
          return prev.map(item =>
            item.product.product_id === product.product_id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prev, { product, quantity }];
        }
      });
    }
  }

  // Remove from cart
  async function removeFromCart(productId) {
    if (user) {
      try {
        const cart = await getOrCreateCart(user.id);
        
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.cart_id)
          .eq('product_id', productId);
        
        const supaCart = await fetchSupabaseCart(user.id);
        setCartItems(supaCart);
      } catch (error) {
        console.error('Error removing from cart:', error);
        showToast('Error removing from cart');
      }
    } else {
      setCartItems(prev => prev.filter(item => item.product.product_id !== productId));
    }
  }

  // Remove multiple items from cart (for partial cart clearing after checkout)
  async function removeMultipleFromCart(productIds) {
    if (user) {
      try {
        const cart = await getOrCreateCart(user.id);
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.cart_id)
          .in('product_id', productIds);
        const supaCart = await fetchSupabaseCart(user.id);
        setCartItems(supaCart);
      } catch (error) {
        console.error('Error removing multiple items from cart:', error);
        showToast('Error removing items from cart');
      }
    } else {
      setCartItems(prev => prev.filter(item => !productIds.includes(item.product.product_id)));
    }
  }

  // Clear cart (optionally only certain product IDs)
  async function clearCart(productIds = null) {
    if (productIds && productIds.length > 0) {
      await removeMultipleFromCart(productIds);
      return;
    }
    if (user) {
      try {
        const cart = await getOrCreateCart(user.id);
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.cart_id);
        setCartItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
        showToast('Error clearing cart');
      }
    } else {
      setCartItems([]);
    }
  }

  // Unique product count (for cart bubble)
  const uniqueCount = cartItems.length;

  function showToast(message) {
    setToast({ visible: true, message });
  }

  function handleToastClose() {
    setToast({ visible: false, message: '' });
  }

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, removeMultipleFromCart, uniqueCount, showToast, loading }}>
      {children}
      <Toast message={toast.message} visible={toast.visible} onClose={handleToastClose} />
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 