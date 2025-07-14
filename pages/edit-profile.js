import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ full_name: '', avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(async ({ data }) => {
      if (ignore) return;
      if (!data.session?.user) {
        router.replace('/login');
        return;
      }
      setUser(data.session.user);
      // Fetch profile info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', data.session.user.id)
        .single();
      setProfile({
        full_name: profileData?.full_name || '',
        avatar_url: profileData?.avatar_url || '',
      });
      setLoading(false);
    });
    return () => { ignore = true; };
  }, [router]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: profile.full_name, avatar_url: profile.avatar_url })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/profile');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-cyberpunk-bg flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyberpunk-neonBlue mx-auto shadow-neon"></div><span className="ml-4 text-cyberpunk-neonPurple font-nexus">Loading...</span></div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-cyberpunk-surface rounded-xl shadow-neon border border-cyberpunk-neonBlue min-h-[60vh]">
      <h1 className="text-2xl font-nexus font-bold mb-6 text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7]">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-cyberpunk-neonBlue font-nexus font-bold mb-2">Display Name</label>
          <input
            type="text"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
            placeholder="Enter your display name"
            maxLength={32}
          />
        </div>
        <div>
          <label className="block text-cyberpunk-neonBlue font-nexus font-bold mb-2">Avatar URL</label>
          <input
            type="text"
            name="avatar_url"
            value={profile.avatar_url}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
            placeholder="Paste an image URL (https://...)"
          />
          {profile.avatar_url && (
            <div className="mt-2 flex justify-center">
              <img src={profile.avatar_url} alt="Avatar preview" className="w-24 h-24 rounded-full border-2 border-cyberpunk-neonBlue shadow-neon object-cover" />
            </div>
          )}
        </div>
        {error && <div className="text-red-400 font-bold">{error}</div>}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-nexus font-bold rounded-lg transition-all duration-300 shadow-neon-pink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="px-8 py-3 bg-cyberpunk-neonBlue text-cyberpunk-bg rounded-lg font-nexus font-bold shadow-neon border border-cyberpunk-neonPink hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 