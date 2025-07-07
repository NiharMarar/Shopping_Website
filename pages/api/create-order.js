import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '../../lib/email';

console.log("🚨 /api/create-order.js loaded");

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for RLS bypass
);

export default async function handler(req, res) {
  console.log('🔄 API: create-order endpoint called');
  
  if (req.method !== 'POST') {
    console.log('❌ API: Method not allowed');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cartItems, shippingAddress, billingAddress, email, user_id, session_id } = req.body;
  if (!cartItems || cartItems.length === 0) {
    console.log('❌ API: Cart is empty');
    return res.status(400).json({ error: 'Cart is empty' });
  }
  if (!email) {
    console.log('❌ API: Email is required');
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    console.log('📦 API: Creating order with:', { 
      cartItemsLength: cartItems?.length, 
      userId: user_id,
      sessionId: session_id,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    // Check if order already exists for this session
    if (session_id) {
      console.log('🔍 API: Checking for existing order with session_id:', session_id);
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select('order_id, order_number, status')
        .eq('stripe_session_id', session_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ API: Error checking for existing order:', checkError);
        throw checkError;
      }

      if (existingOrder) {
        console.log('⚠️ API: Order already exists for session:', existingOrder);
        return res.status(200).json({ 
          success: true, 
          orderId: existingOrder.order_id,
          orderNumber: existingOrder.order_number,
          message: 'Order already exists'
        });
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // Calculate total
    const totalAmount = cartItems.reduce((total, item) => {
      const price = item.products?.product_price || item.product?.product_price || item.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);

    console.log('💰 API: Total amount:', totalAmount);

    // Insert order
    console.log('📝 API: Creating order in database...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user_id || null,
          order_number: orderNumber,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          status: 'pending',
          email: email,
          stripe_session_id: session_id || null
        }
      ])
      .select()
      .single();
    if (orderError) {
      console.error('❌ API: Order creation error:', orderError);
      throw orderError;
    }

    console.log('✅ API: Order created:', order);

    // Insert order items
    console.log('📦 API: Creating order items...');
    const orderItems = cartItems.map(item => {
      const unit_price = item.products?.product_price || item.product?.product_price || item.price || 0;
      const quantity = item.quantity || 1;
      return {
        order_id: order.order_id,
        product_id: item.product_id || item.products?.product_id || item.product?.product_id,
        quantity,
        unit_price,
        total_price: unit_price * quantity
      };
    });
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    if (itemsError) {
      console.error('❌ API: Order items creation error:', itemsError);
      throw itemsError;
    }

    console.log('✅ API: Order items created successfully');

    // Fetch order items with product info for the email
    const { data: order_items_full, error: fetchItemsError } = await supabase
      .from('order_items')
      .select('quantity, unit_price, total_price, product:product_id(product_name)')
      .eq('order_id', order.order_id);

    if (fetchItemsError) {
      console.error('❌ API: Fetch order items for email error:', fetchItemsError);
    }

    // Send order confirmation email if email is provided
    console.log('📧 API: Email received from body:', email);
    console.log('📧 Attempting to send order confirmation email to:', email);
    if (email) {
      try {
        await sendOrderConfirmationEmail({
          to: email,
          order: {
            order_number: order.order_number,
            created_at: order.created_at,
            order_items: order_items_full || [],
            total_amount: totalAmount
          }
        });
        console.log('📧 Order confirmation email sent to', email);
      } catch (emailErr) {
        console.error('❌ Error sending order confirmation email:', emailErr);
      }
    }

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