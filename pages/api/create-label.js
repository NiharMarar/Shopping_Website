export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from_address, to_address, parcel } = req.body;

  if (!from_address || !to_address || !parcel) {
    return res.status(400).json({ error: 'Missing required fields: from_address, to_address, parcel' });
  }

  try {
    // 1. Create shipment
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

    if (!shipmentResponse.ok) {
      return res.status(400).json({ error: shipment });
    }

    if (!shipment.rates || shipment.rates.length === 0) {
      return res.status(400).json({ error: 'No rates available for this shipment.' });
    }

    // 2. Get the first available rate (you can add logic to let user pick)
    const rate = shipment.rates[0];

    // 3. Purchase the label
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

    if (!transactionResponse.ok) {
      return res.status(400).json({ error: transaction });
    }

    if (transaction.status === 'SUCCESS') {
      return res.status(200).json({
        label_url: transaction.label_url,
        tracking_number: transaction.tracking_number,
        rate: rate,
        shipment_id: shipment.object_id,
      });
    } else {
      return res.status(400).json({ error: transaction.messages });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
} 