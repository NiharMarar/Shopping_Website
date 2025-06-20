'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  console.log('🚨 Login: Component starting to render');
  console.log('🔍 Login component rendering...');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  console.log('🚨 Login: About to call useAuth()');
  const { signIn, user, loading: authLoading } = useAuth();
  console.log('🚨 Login: useAuth() completed');
  const { message } = router.query;

  console.log('🚨 Login: Component state - user:', user?.email, 'authLoading:', authLoading, 'loading:', loading, 'router.pathname:', router.pathname);
  console.log('🔍 Login component state - user:', user?.email, 'authLoading:', authLoading, 'loading:', loading);

  // 1) if the user is already logged in, send them to /profile
  useEffect(() => {
    console.log('🚨 Login: useEffect TRIGGERED - authLoading:', authLoading, 'user:', user?.email);
    if (!authLoading && user) {
      console.log('🚨 Login: REDIRECT CONDITION MET - user is logged in, redirecting to profile');
      console.log('🚨 Login: About to call router.replace("/profile")');
      router.replace('/profile');
      console.log('🚨 Login: router.replace() called');
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e) => {
    console.log('🚨 Login: Form submitted');
    e.preventDefault();
    console.log('🔍 Login form submitted for:', email);
    try {
      console.log('🚨 Login: About to setError(null)');
      setError(null);
      console.log('🚨 Login: About to setLoading(true)');
      setLoading(true);
      console.log('🔍 Calling signIn function...');
      console.log('🚨 Login: About to call signIn()');
      await signIn(email, password);
      console.log('🚨 Login: signIn() completed successfully');
      console.log('🔍 SignIn function completed');
    } catch (error) {
      console.error('🚨 Login: signIn() FAILED:', error);
      console.error('🔍 Login error:', error);
      console.log('🚨 Login: About to setError');
      setError(error.message);
    } finally {
      console.log('🚨 Login: About to setLoading(false)');
      setLoading(false);
      console.log('🔍 Login form loading set to false');
    }
  };

  console.log('🚨 Login: About to return JSX');
  console.log('🔍 Login component returning JSX...');

  // 2) while auth is still loading, return a loader
  if (authLoading) {
    console.log('🚨 Login: Auth still loading, showing loader');
    return <div>Loading auth…</div>;
  }

  // 3) otherwise show the login form
  return (
    <>
      <Head>
        <title>Login - Your Shop</title>
        <meta name="description" content="Login to your account" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          {message && (
            <div className="mt-2 text-center text-sm text-green-600">
              {message}
            </div>
          )}
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Sign up
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 