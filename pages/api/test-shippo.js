export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if SHIPPO_API_KEY is set
  if (!process.env.SHIPPO_API_KEY) {
    return res.status(500).json({ error: 'SHIPPO_API_KEY not configured' });
  }

  try {
    // Test shipment creation with sample data
    const testShipment = {
      address_from: {
        name: 'Test Store',
        street1: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zip: '90210',
        country: 'US',
        email: 'test@example.com',
        phone: '555-555-5555',
      },
      address_to: {
        name: 'Test Customer',
        street1: '456 Customer Ave',
        city: 'Customer City',
        state: 'NY',
        zip: '10001',
        country: 'US',
        email: 'customer@example.com',
      },
      parcels: [{
        length: '12',
        width: '8',
        height: '6',
        distance_unit: 'in',
        weight: '16',
        mass_unit: 'oz',
      }],
      async: false,
    };

    console.log('🧪 Testing Shippo API with sample data...');

    const shipmentResponse = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testShipment),
    });

    const shipment = await shipmentResponse.json();
    console.log('🧪 Shipment response:', shipment);

    if (!shipmentResponse.ok) {
      return res.status(400).json({ 
        error: 'Shipment creation failed', 
        details: shipment,
        apiKeyConfigured: !!process.env.SHIPPO_API_KEY
      });
    }

    if (!shipment.rates || shipment.rates.length === 0) {
      return res.status(400).json({ 
        error: 'No rates available for test shipment',
        shipment: shipment
      });
    }

    // Get the first rate
    const rate = shipment.rates[0];
    console.log('🧪 Selected rate:', rate);

    // Create transaction (label)
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
    console.log('🧪 Transaction response:', transaction);

    if (!transactionResponse.ok) {
      return res.status(400).json({ 
        error: 'Transaction creation failed', 
        details: transaction 
      });
    }

    if (transaction.status === 'SUCCESS') {
      return res.status(200).json({
        success: true,
        message: 'Shippo API is working correctly',
        tracking_number: transaction.tracking_number,
        label_url: transaction.label_url,
        shipment_id: shipment.object_id,
        rate: rate,
        transaction: transaction
      });
    } else {
      return res.status(400).json({ 
        error: 'Transaction not successful', 
        details: transaction.messages 
      });
    }

  } catch (err) {
    console.error('🧪 Error testing Shippo:', err);
    return res.status(500).json({ 
      error: err.message,
      apiKeyConfigured: !!process.env.SHIPPO_API_KEY
    });
  }
} 