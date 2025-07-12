export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, cartItems } = req.body;

  if (!address || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Missing address or cart items' });
  }

  try {
    // Calculate total weight and dimensions from cart items
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let totalHeight = 0;

    cartItems.forEach(item => {
      const product = item.products || item.product;
      const quantity = item.quantity || 1;
      
      // Default dimensions if not available
      const weight = product?.weight || 1; // 1 lb default
      const length = product?.length || 12; // 12 inches default
      const width = product?.width || 8; // 8 inches default
      const height = product?.height || 6; // 6 inches default
      
      totalWeight += weight * quantity;
      maxLength = Math.max(maxLength, length);
      maxWidth = Math.max(maxWidth, width);
      totalHeight += height * quantity;
    });

    // Ensure minimum dimensions
    totalWeight = Math.max(totalWeight, 1);
    maxLength = Math.max(maxLength, 6);
    maxWidth = Math.max(maxWidth, 4);
    totalHeight = Math.max(totalHeight, 4);

    console.log('📦 Package dimensions:', {
      weight: totalWeight,
      length: maxLength,
      width: maxWidth,
      height: totalHeight
    });

    // Get sender address from environment variables
    const senderAddress = {
      name: process.env.SHIPPO_SENDER_NAME || 'Your Shop',
      street1: process.env.SHIPPO_SENDER_STREET1 || '123 Main St',
      city: process.env.SHIPPO_SENDER_CITY || 'New York',
      state: process.env.SHIPPO_SENDER_STATE || 'NY',
      zip: process.env.SHIPPO_SENDER_ZIP || '10001',
      country: process.env.SHIPPO_SENDER_COUNTRY || 'US'
    };

    // Create shipment for rate calculation
    const shipment = {
      address_from: senderAddress,
      address_to: {
        name: address.name,
        street1: address.street1,
        street2: address.street2 || '',
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country || 'US'
      },
      parcels: [{
        length: maxLength.toString(),
        width: maxWidth.toString(),
        height: totalHeight.toString(),
        distance_unit: 'in',
        weight: totalWeight.toString(),
        mass_unit: 'lb'
      }]
    };

    console.log('🚢 Calculating rates for shipment:', shipment);

    // Get rates from Shippo using fetch instead of the shippo package
    console.log('🔑 Using API key:', process.env.SHIPPO_API_KEY ? 'Present' : 'Missing');
    
    const requestBody = {
      address_from: shipment.address_from,
      address_to: shipment.address_to,
      parcels: shipment.parcels,
      async: false
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const ratesResponse = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', ratesResponse.status);
    console.log('📥 Response headers:', Object.fromEntries(ratesResponse.headers.entries()));

    const responseText = await ratesResponse.text();
    console.log('📥 Raw response:', responseText);

    let rates;
    try {
      rates = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      return res.status(500).json({ 
        error: 'Invalid JSON response from Shippo',
        details: responseText.substring(0, 500)
      });
    }

    if (!ratesResponse.ok) {
      console.error('❌ Shippo rate calculation failed:', rates);
      return res.status(400).json({ 
        error: 'Failed to calculate shipping rates',
        details: rates
      });
    }

    // Check if we have any rates (this is what matters)
    if (!rates.rates || rates.rates.length === 0) {
      console.error('❌ No rates returned from Shippo:', rates);
      return res.status(400).json({ 
        error: 'No shipping rates available',
        details: rates
      });
    }

    // Log messages but don't treat them as errors (they're just informational)
    if (rates.messages && rates.messages.length > 0) {
      console.log('ℹ️ Shippo messages (informational):', rates.messages);
    }

    // Filter and format rates
    const availableRates = rates.rates
      .filter(rate => rate.amount && rate.amount !== '0.00')
      .map(rate => ({
        rate: rate.amount,
        servicelevel: {
          name: rate.servicelevel.name,
          token: rate.servicelevel.token
        },
        estimated_days: rate.estimated_days || 3,
        provider: rate.provider,
        provider_image: rate.provider_image_75,
        servicelevel_token: rate.servicelevel.token
      }))
      .sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

    console.log('✅ Available rates:', availableRates);

    res.status(200).json({
      success: true,
      rates: availableRates,
      package_info: {
        weight: totalWeight,
        length: maxLength,
        width: maxWidth,
        height: totalHeight
      }
    });

  } catch (error) {
    console.error('❌ Error calculating shipping rates:', error);
    res.status(500).json({ 
      error: 'Failed to calculate shipping rates',
      details: error.message
    });
  }
} 