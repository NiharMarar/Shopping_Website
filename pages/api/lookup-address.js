import { getUspsOAuthToken } from '../../lib/uspsOAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    streetAddress,
    secondaryAddress,
    city,
    state,
    ZIPCode,
    ZIPPlus4
  } = req.query;

  if (!streetAddress || !city || !state) {
    return res.status(400).json({ error: 'Missing required address fields (streetAddress, city, state)' });
  }

  try {
    const token = await getUspsOAuthToken();
    const params = new URLSearchParams({
      streetAddress,
      city,
      state,
    });
    if (secondaryAddress) params.append('secondaryAddress', secondaryAddress);
    if (ZIPCode) params.append('ZIPCode', ZIPCode);
    if (ZIPPlus4) params.append('ZIPPlus4', ZIPPlus4);

    const uspsUrl = `https://apis-tem.usps.com/addresses/v3/address?${params.toString()}`;
    // Log the outgoing request for debugging
    console.log('USPS Address Lookup URL:', uspsUrl);
    const uspsRes = await fetch(uspsUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${token}`,
      },
    });

    const rawText = await uspsRes.text();
    let uspsData;
    try {
      uspsData = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({ error: 'USPS API did not return valid JSON', status: uspsRes.status, raw: rawText });
    }

    if (!uspsRes.ok) {
      return res.status(500).json({ error: uspsData, status: uspsRes.status });
    }
    return res.status(200).json({ data: uspsData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
} 