let cachedToken = null;
let tokenExpiresAt = 0;

export async function getUspsOAuthToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.USPS_CONSUMER_KEY;
  const clientSecret = process.env.USPS_CONSUMER_SECRET;

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);

  // const response = await fetch('https://api.usps.com/oauth2/v3/token', { //production
  const response = await fetch('https://apis-tem.usps.com/oauth2/v3/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch USPS OAuth token');
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
} 