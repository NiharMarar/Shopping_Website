import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// In-memory store for carts (replace with database in production)
const carts = new Map();

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const userId = req.query.userId || 'anonymous';
        const cart = carts.get(userId) || [];
        return res.status(200).json(cart);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    case 'POST':
      try {
        const { productId, quantity } = req.body;
        const userId = req.body.userId || 'anonymous';
        
        let cart = carts.get(userId) || [];
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.push({ productId, quantity });
        }

        carts.set(userId, cart);
        return res.status(200).json(cart);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    case 'PUT':
      try {
        const { productId, quantity } = req.body;
        const userId = req.body.userId || 'anonymous';
        
        let cart = carts.get(userId) || [];
        const itemIndex = cart.findIndex(item => item.productId === productId);

        if (itemIndex > -1) {
          if (quantity <= 0) {
            cart.splice(itemIndex, 1);
          } else {
            cart[itemIndex].quantity = quantity;
          }
          carts.set(userId, cart);
        }

        return res.status(200).json(cart);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    case 'DELETE':
      try {
        const { productId } = req.body;
        const userId = req.body.userId || 'anonymous';
        
        let cart = carts.get(userId) || [];
        cart = cart.filter(item => item.productId !== productId);
        carts.set(userId, cart);

        return res.status(200).json(cart);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
