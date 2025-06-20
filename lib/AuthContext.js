'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useRouter } from 'next/router';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  console.log('🚨 AuthProvider: Component starting to render');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log('🚨 AuthProvider: State initialized - user:', user?.email, 'loading:', loading, 'router.pathname:', router.pathname);

  console.log('🔍 AuthProvider render - user:', user?.email, 'loading:', loading);

  useEffect(() => {
    console.log('🚨 AuthProvider: useEffect TRIGGERED - this should only happen once!');
    console.log('🔍 AuthProvider useEffect - initializing auth...');
    
    // 1) fetch initial session
    console.log('🚨 AuthProvider: About to call supabase.auth.getSession()');
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        console.log('🚨 AuthProvider: getSession() SUCCESS - session:', session?.user?.email || 'no session');
        console.log('🔍 Session check result:', session?.user?.email || 'no session');
        console.log('🚨 AuthProvider: About to setUser and setLoading(false)');
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('🚨 AuthProvider: setUser and setLoading completed');
      })
      .catch((err) => {
        console.error('🚨 AuthProvider: getSession() FAILED:', err);
        console.error('🔍 Failed to get session', err);
        console.log('🚨 AuthProvider: About to setUser(null) and setLoading(false)');
        setUser(null);
        setLoading(false);
        console.log('🚨 AuthProvider: Error handling completed');
      });

    // 2) subscribe to future changes
    console.log('🚨 AuthProvider: About to set up auth state listener');
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('🚨 AuthProvider: Auth state change detected - event:', _event, 'user:', session?.user?.email || 'no user');
        console.log('🔍 Auth state changed:', _event, session?.user?.email || 'no user');
        console.log('🚨 AuthProvider: About to update state from listener');
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('🚨 AuthProvider: State updated from listener');
      }
    );

    // cleanup
    return () => {
      console.log('🚨 AuthProvider: useEffect cleanup function called');
      console.log('🔍 Cleaning up auth subscription');
      listener.subscription.unsubscribe();
      console.log('🚨 AuthProvider: Cleanup completed');
    };
  }, []); // ← no extra deps

  // signIn / signUp / signOut stay basically the same
  const signIn = async (email, password) => {
    console.log('🚨 AuthProvider: signIn function called with email:', email);
    console.log('🔍 SignIn attempt for:', email);
    console.log('🚨 AuthProvider: About to setLoading(true)');
    setLoading(true);
    console.log('🚨 AuthProvider: About to call supabase.auth.signInWithPassword');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('🚨 AuthProvider: signIn FAILED:', error);
      console.error('🔍 SignIn error:', error);
      console.log('🚨 AuthProvider: About to setLoading(false) and throw error');
      setLoading(false);
      throw error;
    }
    console.log('🚨 AuthProvider: signIn SUCCESS - user:', data.user?.email);
    console.log('🔍 SignIn successful:', data.user?.email);
    console.log('🚨 AuthProvider: About to setUser and setLoading(false)');
    setUser(data.user);
    setLoading(false);
    console.log('🚨 AuthProvider: About to redirect to /profile');
    router.push('/profile');
    console.log('🚨 AuthProvider: Redirect initiated');
  };

  const signUp = async (email, password) => {
    console.log('🚨 AuthProvider: signUp function called with email:', email);
    console.log('🔍 SignUp attempt for:', email);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('🚨 AuthProvider: signUp FAILED:', error);
      console.error('🔍 SignUp error:', error);
      throw error;
    }
    console.log('🚨 AuthProvider: signUp SUCCESS');
    console.log('🔍 SignUp successful, redirecting to login');
    router.push('/login?message=Check your email');
  };

  const signOut = async () => {
    console.log('🚨 AuthProvider: signOut function called');
    console.log('🔍 SignOut attempt');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('🚨 AuthProvider: signOut FAILED:', error);
      console.error('🔍 SignOut error:', error);
      throw error;
    }
    console.log('🚨 AuthProvider: signOut SUCCESS');
    console.log('🔍 SignOut successful, redirecting to login');
    console.log('🚨 AuthProvider: About to setUser(null)');
    setUser(null);
    console.log('🚨 AuthProvider: About to redirect to /login');
    router.push('/login');
  };

  console.log('🚨 AuthProvider: About to return JSX - user:', user?.email, 'loading:', loading);
  console.log('🔍 AuthProvider returning context with user:', user?.email, 'loading:', loading);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  console.log('🚨 useAuth: Hook called');
  const context = useContext(AuthContext);
  console.log('🚨 useAuth: Context value:', context);
  return context;
}; 