'use client';

console.log('🚨 profile.js: file loaded');

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const redirecting = useRef(false);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(async ({ data }) => {
      if (ignore) return;
      setUser(data.session?.user ?? null);
      if (!data.session?.user && !redirecting.current) {
        redirecting.current = true;
        router.replace('/login');
      } else if (data.session?.user) {
        // Fetch profile info from profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url, role, updated_at')
          .eq('id', data.session.user.id)
          .single();
        setProfile(profileData);
        // Fetch recent orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('order_id, order_number, order_status, total_amount, created_at')
          .eq('user_id', data.session.user.id)
          .order('created_at', { ascending: false })
          .limit(2);
        setRecentOrders(Array.isArray(ordersData) ? ordersData : []);
      }
      setLoading(false);
    });
    return () => { ignore = true; };
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-cyberpunk-bg flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyberpunk-neonBlue mx-auto shadow-neon"></div><span className="ml-4 text-cyberpunk-neonPurple font-nexus">Loading profile...</span></div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-cyberpunk-bg flex items-center justify-center"><span className="text-cyberpunk-neonPink font-nexus text-xl">You must be logged in to view this page.</span></div>;
  }

  // Display name logic
  const displayName = profile?.full_name || profile?.username || `User${user.id.slice(-4)}`;
  const joinDate = profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : '';
  const avatarUrl = profile?.avatar_url || '/default-avatar.png';
  const role = profile?.role || 'user';

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-cyberpunk-surface rounded-xl shadow-neon border border-cyberpunk-neonBlue min-h-[60vh]">
      <div className="flex flex-col items-center mb-6">
        <div className="w-28 h-28 rounded-full border-4 border-cyberpunk-neonBlue shadow-neon mb-2 overflow-hidden bg-cyberpunk-bg">
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="text-2xl font-nexus font-bold text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7]">{displayName}</div>
        <div className="text-cyberpunk-neonPurple font-nexus text-sm mt-1">{user.email}</div>
        <button
          className="mt-3 px-4 py-2 bg-gradient-to-r from-cyberpunk-neonBlue to-cyberpunk-neonPink text-cyberpunk-bg rounded font-nexus font-bold shadow-neon border border-cyberpunk-neonBlue hover:from-cyberpunk-neonPink hover:to-cyberpunk-neonBlue transition-colors"
          onClick={() => router.push('/edit-profile')}
        >
          Edit Profile
        </button>
      </div>
      <hr className="my-4 border-cyberpunk-neonBlue" />
      <h2 className="text-xl font-nexus font-semibold mb-2 text-cyberpunk-neonPink">Order History</h2>
      {/* Recent orders preview */}
      <div className="mb-4">
        {recentOrders.length === 0 ? (
          <div className="text-cyberpunk-neonPurple">No recent orders yet.</div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.order_id} className="bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg p-4 shadow-neon flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-cyberpunk-neonBlue font-nexus font-bold">Order #{order.order_number}</div>
                  <div className="text-cyberpunk-neonPurple text-sm">{new Date(order.created_at).toLocaleDateString()}</div>
                  <div className="text-cyberpunk-neonPink text-sm font-bold">Status: {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}</div>
                </div>
                <div className="text-cyberpunk-neonPink font-nexus text-lg mt-2 md:mt-0">${order.total_amount}</div>
              </div>
            ))}
          </div>
        )}
      </div>
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
