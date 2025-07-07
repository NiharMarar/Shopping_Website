import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        order_number,
        order_status,
        tracking_number,
        tracking_carrier,
        total_amount,
        created_at,
        shipped_at,
        delivered_at,
        shipping_address,
        billing_address,
        order_items (
          quantity,
          unit_price,
          total_price,
          product:product_id (
            product_name,
            image_url
          )
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json({ error: 'Error fetching order details' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ success: true, order });

  } catch (error) {
    console.error('Error in get-order-details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 