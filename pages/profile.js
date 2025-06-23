'use client';

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
    supabase.auth.getUser().then(({ data }) => {
      if (ignore) return;
      setUser(data.user);
      setLoading(false);
      if (!data.user && !redirecting.current) {
        redirecting.current = true;
        console.log('🔒 Not logged in, redirecting to /login');
        router.replace('/login');
      } else if (data.user) {
        console.log('👤 User loaded:', data.user.email);
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
      {/* Add more user info here as needed */}
      <hr className="my-4" />
      <h2 className="text-xl font-semibold mb-2">Order History</h2>
      <p>(Order history will appear here in the future.)</p>
      <button
        onClick={() => supabase.auth.signOut()}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Log out
      </button>
    </div>
  );
} 