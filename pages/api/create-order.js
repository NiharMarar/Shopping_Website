import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, cartItems, user } = req.body;

    console.log('Creating order with:', { sessionId, cartItemsLength: cartItems?.length, userId: user?.id });

    if (!sessionId || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (total, item) => total + (item.product.product_price * item.quantity),
      0
    );

    console.log('Total amount:', totalAmount);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user?.id || null,
        stripe_session_id: sessionId,
        order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        total_amount: totalAmount,
        status: 'pending'
      }])
      .select('order_id, order_number')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }

    console.log('Order created:', order);

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.order_id,
      product_id: item.product.product_id,
      quantity: item.quantity,
      unit_price: item.product.product_price,
      total_price: item.product.product_price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      throw itemsError;
    }

    console.log('Order items created successfully');

    res.status(200).json({ 
      success: true, 
      orderId: order.order_id,
      orderNumber: order.order_number 
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order: ' + error.message });
  }
} 