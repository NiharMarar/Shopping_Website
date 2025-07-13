import { verifyAdminCredentials } from '../../../lib/adminAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set admin session cookie (expires in 24 hours)
    res.setHeader('Set-Cookie', `admin_session=${JSON.stringify({ isAdmin: true, username })}; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict`);

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 