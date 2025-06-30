import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionToken } = req.query;

    if (!sessionToken) {
      return res.status(400).json({ error: 'Session token required' });
    }

    console.log('🔍 Retrieving checkout data for token:', sessionToken);

    // Get checkout data from Supabase
    const { data: checkoutSession, error } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (error) {
      console.error('❌ Error retrieving checkout session:', error);
      return res.status(404).json({ error: 'Checkout session not found or expired' });
    }

    if (!checkoutSession) {
      return res.status(404).json({ error: 'Checkout session not found or expired' });
    }

    // Check if session has expired
    if (new Date() > new Date(checkoutSession.expires_at)) {
      console.log('⏰ Checkout session expired:', sessionToken);
      // Clean up expired session
      await supabase
        .from('checkout_sessions')
        .delete()
        .eq('session_token', sessionToken);
      return res.status(404).json({ error: 'Checkout session expired' });
    }

    // Mark session as used and delete it to prevent reuse
    await supabase
      .from('checkout_sessions')
      .delete()
      .eq('session_token', sessionToken);

    console.log('✅ Retrieved checkout data for token:', sessionToken);

    // Return the checkout data
    res.status(200).json({
      cartItems: checkoutSession.cart_items,
      shippingAddress: checkoutSession.shipping_address,
      email: checkoutSession.email
    });

  } catch (error) {
    console.error('Error retrieving checkout data:', error);
    res.status(500).json({ error: 'Error retrieving checkout data' });
  }
} 