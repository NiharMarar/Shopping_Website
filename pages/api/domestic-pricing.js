import { getUspsOAuthToken } from '../../lib/uspsOAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    originZIPCode,
    destinationZIPCode,
    weight,
    length,
    width,
    height,
    mailClass,
    processingCategory,
    destinationEntryFacilityType,
    rateIndicator,
    priceType,
    mailingDate
  } = req.body;

  if (!originZIPCode || !destinationZIPCode || !weight || !length || !width || !height || !mailClass || !processingCategory || !destinationEntryFacilityType || !rateIndicator || !priceType || !mailingDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const token = await getUspsOAuthToken();
    const uspsUrl = 'https://apis-tem.usps.com/prices/v3/base-rates/search';
    const body = {
      originZIPCode,
      destinationZIPCode,
      weight: Number(weight),
      length: Number(length),
      width: Number(width),
      height: Number(height),
      mailClass,
      processingCategory,
      destinationEntryFacilityType,
      rateIndicator,
      priceType,
      mailingDate
    };
    const uspsRes = await fetch(uspsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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