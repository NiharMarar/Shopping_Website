import { getUspsOAuthToken } from '../../lib/uspsOAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trackingNumber } = req.body;
  if (!trackingNumber) {
    return res.status(400).json({ error: 'Missing tracking number' });
  }

  try {
    const token = await getUspsOAuthToken();
    const uspsUrl = 'https://apis-tem.usps.com/track/v2/tracking';
    const uspsRes = await fetch(uspsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trackingNumber: [trackingNumber],
      }),
    });
    const uspsData = await uspsRes.json();
    if (!uspsRes.ok) {
      return res.status(500).json({ error: uspsData });
    }
    return res.status(200).json({ data: uspsData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
} 