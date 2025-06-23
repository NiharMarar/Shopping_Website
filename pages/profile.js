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
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">You must be logged in to view this page.</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <hr className="my-4" />
      <h2 className="text-xl font-semibold mb-2">Order History</h2>
      <p>(Order history will appear here in the future.)</p>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = '/login';
        }}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Log out
      </button>
    </div>
  );
}
