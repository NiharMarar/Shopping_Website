// Simple admin authentication utility
export function verifyAdminCredentials(username, password) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured in environment variables');
    return false;
  }
  
  return username === adminUsername && password === adminPassword;
}

export function isAdminSession(session) {
  return session && session.isAdmin === true;
} 