'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';

export default function Profile() {
  console.log('🚨 Profile: Component starting to render');
  console.log('🔍 Profile component rendering...');
  
  console.log('🚨 Profile: About to call useAuth()');
  const { user, loading } = useAuth();
  console.log('🚨 Profile: useAuth() completed');
  const router = useRouter();

  console.log('🚨 Profile: Component state - user:', user?.email, 'loading:', loading, 'router.pathname:', router.pathname);
  console.log('🔍 Profile component state - user:', user?.email, 'loading:', loading);

  // redirect to login if not authenticated
  useEffect(() => {
    console.log('🚨 Profile: useEffect TRIGGERED - user:', user?.email, 'loading:', loading);
    console.log('🔍 Profile useEffect - user:', user?.email, 'loading:', loading);
    if (!loading && !user) {
      console.log('🚨 Profile: REDIRECT CONDITION MET - no user and not loading, should redirect to login');
      console.log('🔍 No user and not loading, redirecting to login');
      console.log('🚨 Profile: About to call router.replace("/login")');
      router.replace('/login');
      console.log('🚨 Profile: router.replace() called');
    } else {
      console.log('🚨 Profile: No redirect needed - loading:', loading, 'user:', user?.email);
    }
  }, [loading, user, router]);

  console.log('🚨 Profile: About to return JSX');

  if (loading) {
    console.log('🚨 Profile: Still loading, showing loader');
    return <div>Loading profile…</div>;
  }
  
  if (!user) {
    console.log('🚨 Profile: No user, returning null (redirecting)');
    return null; // redirecting
  }

  console.log('🚨 Profile: Showing user profile for:', user.email);
  console.log('🔍 Profile component showing user profile for:', user.email);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Page</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome!</h2>
          <p className="text-gray-600">Email: {user.email}</p>
          <p className="text-gray-600">User ID: {user.id}</p>
          <p className="text-gray-600">Created: {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
} 