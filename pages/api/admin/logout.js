export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Clear admin session cookie
    res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict');
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 