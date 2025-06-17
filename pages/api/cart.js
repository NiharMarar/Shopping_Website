import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Initialize Supabase client
const supabase = createRouteHandlerClient({ cookies });

export default async function handler(req, res) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const { data: cartItems, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            products (*)
          `)
          .eq('user_id', userId);

        if (error) throw error;
        return res.status(200).json(cartItems);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    case 'POST':
      try {
        const { productId, quantity } = req.body;

        // Check if product exists
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError || !product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        // Check if item already in cart
        const { data: existingItem, error: existingError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .single();

        if (existingItem) {
          // Update quantity if item exists
          const { data: updatedItem, error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id)
            .select()
            .single();

          if (updateError) throw updateError;
          return res.status(200).json(updatedItem);
        }

        // Add new item to cart
        const { data: newItem, error: insertError } = await supabase
          .from('cart_items')
          .insert([
            {
              user_id: userId,
              product_id: productId,
              quantity,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        return res.status(201).json(newItem);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    case 'PUT':
      try {
        const { itemId, quantity } = req.body;

        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId)
            .eq('user_id', userId);

          if (deleteError) throw deleteError;
          return res.status(200).json({ message: 'Item removed from cart' });
        }

        // Update quantity
        const { data: updatedItem, error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) throw updateError;
        return res.status(200).json(updatedItem);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    case 'DELETE':
      try {
        const { itemId } = req.body;

        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId);

        if (error) throw error;
        return res.status(200).json({ message: 'Item removed from cart' });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
