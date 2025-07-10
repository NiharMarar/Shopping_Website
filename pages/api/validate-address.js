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
    const token = await getUspsOAuthToken();
    const uspsUrl = 'https://apis-tem.usps.com/address/v3/validate';
    const uspsRes = await fetch(uspsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: [address], // USPS expects an array of addresses
      }),
    });

    const rawText = await uspsRes.text();
    let uspsData;
    try {
      uspsData = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({ error: 'USPS API did not return valid JSON', raw: rawText });
    }

    if (!uspsRes.ok) {
      return res.status(500).json({ error: uspsData });
    }
    return res.status(200).json({ data: uspsData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
} 