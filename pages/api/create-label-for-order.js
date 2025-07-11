import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order_id } = req.body;
  if (!order_id) {
    return res.status(400).json({ error: 'Missing order_id' });
  }

  console.log('🚢 Starting label creation for order:', order_id);

  // 1. Fetch order, order_items, and products
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', order_id)
    .single();
  if (orderError || !order) {
    console.error('❌ Order not found:', orderError);
    return res.status(404).json({ error: 'Order not found' });
  }

  console.log('✅ Order found:', { order_id: order.order_id, email: order.email });

  const { data: order_items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', order_id);
  if (itemsError || !order_items || order_items.length === 0) {
    console.error('❌ No order items found:', itemsError);
    return res.status(404).json({ error: 'No order items found' });
  }

  console.log('✅ Order items found:', order_items.length);

  // Fetch all products in the order
  const productIds = order_items.map(item => item.product_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('product_id, length, width, height, weight, product_name')
    .in('product_id', productIds);
  if (productsError || !products) {
    console.error('❌ Products not found:', productsError);
    return res.status(404).json({ error: 'Products not found' });
  }

  console.log('✅ Products found:', products.map(p => ({ name: p.product_name, dimensions: { length: p.length, width: p.width, height: p.height, weight: p.weight } })));

  // 2. Calculate total weight and max dimensions
  let totalWeight = 0;
  let maxLength = 0, maxWidth = 0, maxHeight = 0;
  for (const item of order_items) {
    const product = products.find(p => p.product_id === item.product_id);
    if (!product) continue;
    totalWeight += (Number(product.weight) || 0) * item.quantity;
    maxLength = Math.max(maxLength, Number(product.length) || 0);
    maxWidth = Math.max(maxWidth, Number(product.width) || 0);
    maxHeight = Math.max(maxHeight, Number(product.height) || 0);
  }

  console.log('📦 Calculated dimensions:', { totalWeight, maxLength, maxWidth, maxHeight });

  // Use default dimensions if products don't have them
  if (totalWeight === 0) totalWeight = 16; // 1 lb default
  if (maxLength === 0) maxLength = 12; // 12 inches default
  if (maxWidth === 0) maxWidth = 8; // 8 inches default
  if (maxHeight === 0) maxHeight = 6; // 6 inches default

  console.log('📦 Final dimensions with defaults:', { totalWeight, maxLength, maxWidth, maxHeight });

  // 3. Prepare addresses
  const shipping = typeof order.shipping_address === 'object' ? order.shipping_address : JSON.parse(order.shipping_address);
  console.log('📮 Shipping address:', shipping);
  
  const from_address = {
    name: process.env.SHIPPO_FROM_NAME,
    street1: process.env.SHIPPO_FROM_STREET1,
    city: process.env.SHIPPO_FROM_CITY,
    state: process.env.SHIPPO_FROM_STATE,
    zip: process.env.SHIPPO_FROM_ZIP ? String(process.env.SHIPPO_FROM_ZIP) : '',
    country: process.env.SHIPPO_FROM_COUNTRY || 'US',
    email: process.env.SHIPPO_FROM_EMAIL,
    phone: process.env.SHIPPO_FROM_PHONE || '', // leave blank for now
  };
  const to_address = {
    name: shipping.name || shipping.full_name || 'Customer',
    street1: shipping.street1 || shipping.address1 || shipping.line1,
    city: shipping.city,
    state: shipping.state,
    zip: shipping.zip || shipping.postal_code,
    country: shipping.country || 'US',
    email: order.email,
  };

  console.log('📮 From address:', from_address);
  console.log('📮 To address:', to_address);

  // 4. Create label via Shippo
  try {
    if (!process.env.SHIPPO_API_KEY) {
      console.error('❌ SHIPPO_API_KEY not set');
      return res.status(500).json({ error: 'Shippo API key not configured' });
    }

    const parcel = {
      length: maxLength.toString(),
      width: maxWidth.toString(),
      height: maxHeight.toString(),
      distance_unit: 'in',
      weight: totalWeight.toString(),
      mass_unit: 'oz',
    };

    console.log('📦 Parcel dimensions:', parcel);

    const shipmentResponse = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address_from: from_address,
        address_to: to_address,
        parcels: [parcel],
        async: false,
      }),
    });
    const shipment = await shipmentResponse.json();
    console.log('🚢 Shipment response:', shipment);
    
    if (!shipmentResponse.ok) {
      console.error('❌ Shipment creation failed:', shipment);
      return res.status(400).json({ error: shipment });
    }
    if (!shipment.rates || shipment.rates.length === 0) {
      console.error('❌ No rates available for shipment');
      return res.status(400).json({ error: 'No rates available for this shipment.' });
    }
    
    const rate = shipment.rates[0];
    console.log('💰 Selected rate:', rate);

    const transactionResponse = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rate: rate.object_id,
        label_file_type: 'PDF',
        async: false,
      }),
    });
    const transaction = await transactionResponse.json();
    console.log('🏷️ Transaction response:', transaction);
    
    if (!transactionResponse.ok) {
      console.error('❌ Transaction creation failed:', transaction);
      return res.status(400).json({ error: transaction });
    }
    if (transaction.status === 'SUCCESS') {
      // 5. Update order in Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          tracking_number: transaction.tracking_number,
          label_url: transaction.label_url,
          shipment_status: transaction.status,
        })
        .eq('order_id', order_id);

      if (updateError) {
        console.error('❌ Error updating order with tracking:', updateError);
      } else {
        console.log('✅ Order updated with tracking number:', transaction.tracking_number);
        // --- Send tracking/shipping email ---
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-tracking-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order_id,
              trackingNumber: transaction.tracking_number,
              trackingCarrier: order.tracking_carrier || 'USPS',
              orderStatus: 'in_transit',
              customerEmail: order.email,
            }),
          });
          console.log('✅ Tracking/in_transit email sent');
        } catch (err) {
          console.error('❌ Error sending tracking/in_transit email:', err);
        }
        // --- End send tracking/shipping email ---
      }

      return res.status(200).json({
        tracking_number: transaction.tracking_number,
        label_url: transaction.label_url,
        shipment_id: shipment.object_id,
        rate,
        transaction,
      });
    } else {
      console.error('❌ Transaction not successful:', transaction);
      return res.status(400).json({ error: transaction.messages });
    }
  } catch (err) {
    console.error('❌ Error in label creation:', err);
    return res.status(500).json({ error: err.message });
  }
} 