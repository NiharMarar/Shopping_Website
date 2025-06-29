import { createClient } from '@supabase/supabase-js';

console.log("🚨 /api/create-order.js loaded");

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log('🔄 API: create-order endpoint called');
  
  if (req.method !== 'POST') {
    console.log('❌ API: Method not allowed');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, cartItems, user } = req.body;

    console.log('📦 API: Creating order with:', { 
      sessionId, 
      cartItemsLength: cartItems?.length, 
      userId: user?.id,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    if (!sessionId || !cartItems || cartItems.length === 0) {
      console.log('❌ API: Missing required data');
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (total, item) => total + (item.product.product_price * item.quantity),
      0
    );

    console.log('💰 API: Total amount:', totalAmount);

    // Create order
    console.log('📝 API: Creating order in database...');
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
      console.error('❌ API: Order creation error:', orderError);
      throw orderError;
    }

    console.log('✅ API: Order created:', order);

    // Create order items
    console.log('📦 API: Creating order items...');
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
      console.error('❌ API: Order items creation error:', itemsError);
      throw itemsError;
    }

    console.log('✅ API: Order items created successfully');

    const response = { 
      success: true, 
      orderId: order.order_id,
      orderNumber: order.order_number 
    };
    
    console.log('🎉 API: Sending success response:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('💥 API: Error creating order:', error);
    res.status(500).json({ error: 'Error creating order: ' + error.message });
  }
} 