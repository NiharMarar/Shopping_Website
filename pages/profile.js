'use client';

console.log('🚨 profile.js: file loaded');

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const redirecting = useRef(false);

  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(({ data }) => {
      if (ignore) return;
      console.log('Session:', data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (!data.session?.user && !redirecting.current) {
        redirecting.current = true;
        console.log('🔒 Not logged in, redirecting to /login');
        router.replace('/login');
      } else if (data.session?.user) {
        console.log('👤 User loaded:', data.session.user.email);
      }
    });
    return () => { ignore = true; };
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-cyberpunk-bg flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyberpunk-neonBlue mx-auto shadow-neon"></div><span className="ml-4 text-cyberpunk-neonPurple font-nexus">Loading profile...</span></div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-cyberpunk-bg flex items-center justify-center"><span className="text-cyberpunk-neonPink font-nexus text-xl">You must be logged in to view this page.</span></div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-cyberpunk-surface rounded shadow-neon border border-cyberpunk-neonBlue min-h-[60vh]">
      <h1 className="text-2xl font-nexus font-bold mb-4 text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7]">Profile</h1>
      <p className="text-cyberpunk-neonPurple"><strong>Email:</strong> {user.email}</p>
      <hr className="my-4 border-cyberpunk-neonBlue" />
      <h2 className="text-xl font-nexus font-semibold mb-2 text-cyberpunk-neonPink">Order History</h2>
      <button
        onClick={() => router.push('/orders')}
        className="px-4 py-2 bg-cyberpunk-neonBlue text-cyberpunk-bg rounded font-nexus font-bold hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg shadow-neon border border-cyberpunk-neonPink transition-colors"
      >
        View My Orders
      </button>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = '/login';
        }}
        className="mt-4 px-4 py-2 bg-cyberpunk-neonPink text-cyberpunk-bg rounded font-nexus font-bold shadow-neon border border-cyberpunk-neonBlue transition-colors"
      >
        Log out
      </button>
    </div>
  );
}
