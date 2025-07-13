import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        await supabase.auth.signOut();
        return;
      }

      // Success - redirect to dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-cyberpunk-surface rounded-xl shadow-neon border border-cyberpunk-neonBlue p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                ADMIN ACCESS
              </h1>
              <p className="text-cyberpunk-neonPurple text-sm">
                NEXUS Control Center
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-nexus font-bold text-cyberpunk-neonBlue mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink focus:border-transparent"
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-nexus font-bold text-cyberpunk-neonBlue mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink focus:border-transparent"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-nexus font-bold rounded-lg transition-all duration-300 shadow-neon-pink hover:shadow-neon-pink-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  'ACCESS SYSTEM'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a 
                href="/"
                className="text-cyberpunk-neonPurple hover:text-cyberpunk-neonPink text-sm font-nexus transition-colors"
              >
                ← Back to NEXUS
              </a>
            </div>
                      </div>
          </div>
        </div>
    );
} 