import { getUspsOAuthToken } from '../../lib/uspsOAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }

  try {
    const response = await fetch('https://api.goshippo.com/addresses/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...address,
        validate: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: data });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 