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

  // Only redirect if not loading and no user
  useEffect(() => {
    console.log('🚨 Profile: useEffect TRIGGERED - user:', user?.email, 'loading:', loading);
    console.log('🔍 Profile useEffect - user:', user?.email, 'loading:', loading);
    if (!loading && !user) {
      console.log('🚨 Profile: REDIRECT CONDITION MET - no user and not loading, should redirect to login');
      console.log('🔍 No user and not loading, redirecting to login');
      console.log('🚨 Profile: About to call router.push("/login")');
      router.push('/login');
      console.log('🚨 Profile: router.push() called');
    } else {
      console.log('🚨 Profile: No redirect needed - loading:', loading, 'user:', user?.email);
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    console.log('🚨 Profile: Showing loading state');
    console.log('🔍 Profile component showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    console.log('🚨 Profile: Showing not logged in state');
    console.log('🔍 Profile component showing not logged in state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Not Logged In</h1>
          <p className="mt-2 text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
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