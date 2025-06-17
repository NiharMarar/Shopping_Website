import { buffer } from 'micro';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = createRouteHandlerClient({ cookies });

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      // Update order status in database
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('stripe_payment_intent_id', session.payment_intent);

      if (error) {
        console.error('Error updating order:', error);
        return res.status(500).json({ error: 'Error updating order' });
      }

      // Clear the user's cart
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session.metadata.userId);

      if (cartError) {
        console.error('Error clearing cart:', cartError);
        return res.status(500).json({ error: 'Error clearing cart' });
      }

      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      
      // Update order status to failed
      const { error } = await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', session.payment_intent);

      if (error) {
        console.error('Error updating order:', error);
        return res.status(500).json({ error: 'Error updating order' });
      }

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
} 