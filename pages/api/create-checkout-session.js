import { stripe } from '../../lib/stripeClient';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cartItems, successUrl, cancelUrl, email, shippingAddress, billingAddress } = req.body;
    
    console.log('🔍 /api/create-checkout-session received:', {
      cartItemsLength: cartItems?.length,
      email,
      hasShippingAddress: !!shippingAddress,
      hasBillingAddress: !!billingAddress
    });

    // Debug: Log the first cart item structure
    if (cartItems && cartItems.length > 0) {
      console.log('🔍 First cart item structure:', JSON.stringify(cartItems[0], null, 2));
      console.log('💰 Price fields:', {
        'item.products?.product_price': cartItems[0].products?.product_price,
        'item.product?.product_price': cartItems[0].product?.product_price,
        'item.products': cartItems[0].products,
        'item.product': cartItems[0].product
      });
    }

    if (!cartItems || cartItems.length === 0) {
      console.log('❌ No items in cart');
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Create line items for Stripe
    const lineItems = cartItems.map(item => {
      const price = item.products?.product_price || item.product?.product_price;
      console.log('💰 Processing item price:', { price, itemId: item.cart_item_id });
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.products?.product_name || item.product?.product_name,
            description: item.products?.product_description || item.product?.product_description,
            images: (item.products?.image_url || item.product?.image_url) ? [item.products?.image_url || item.product?.image_url] : [],
          },
          unit_amount: Math.round((price || 0) * 100), // Convert to cents, default to 0 if no price
        },
        quantity: item.quantity,
      };
    });

    console.log('💰 Created line items:', lineItems);

    // Generate session token
    const sessionToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/cart`,
      customer_email: email || undefined, // Set Stripe's receipt email if provided
      billing_address_collection: 'required', // Require billing address at checkout
      payment_intent_data: {
        receipt_email: email || undefined,
        shipping: {
          name: shippingAddress?.name,
          address: {
            line1: shippingAddress?.line1,
            line2: shippingAddress?.line2,
            city: shippingAddress?.city,
            state: shippingAddress?.state,
            postal_code: shippingAddress?.postal_code,
            country: shippingAddress?.country,
          }
        }
        // Note: Stripe does not allow pre-filling billing address for security reasons
      },
      metadata: {
        cartItemsCount: cartItems.length.toString(),
        email: email || '',
        shippingName: shippingAddress?.name || '',
        shippingCity: shippingAddress?.city || '',
        sessionToken: sessionToken,
        // Add billing address to metadata for your own reference (not used by Stripe)
        billingName: billingAddress?.name || '',
        billingCity: billingAddress?.city || ''
      }
    });

    // Store cart data in Supabase with session token
    const { error: storageError } = await supabase
      .from('checkout_sessions')
      .insert([
        {
          session_token: sessionToken,
          cart_items: cartItems,
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          email: email,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour expiry
        }
      ]);

    if (storageError) {
      console.error('❌ Error storing checkout session:', storageError);
      throw storageError;
    }

    console.log('✅ Checkout session stored with token:', sessionToken);

    // Clean up old sessions (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    await supabase
      .from('checkout_sessions')
      .delete()
      .lt('created_at', oneHourAgo);

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
} 