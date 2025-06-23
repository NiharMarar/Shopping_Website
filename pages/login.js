<<<<<<< Updated upstream
import { useState } from 'react';
=======
'use client';

import { useEffect, useState, useRef } from 'react';
>>>>>>> Stashed changes
import { useRouter } from 'next/router';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
<<<<<<< Updated upstream
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();
  const { message } = router.query;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

=======
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const redirecting = useRef(false);

  useEffect(() => {
    let ignore = false;
    supabase.auth.getUser().then(({ data }) => {
      if (ignore) return;
      if (data.user && !redirecting.current) {
        redirecting.current = true;
        console.log('✅ Already logged in as:', data.user.email);
        router.replace('/profile');
      } else {
        setChecking(false);
      }
    });
    return () => { ignore = true; };
  }, [router]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !redirecting.current) {
        redirecting.current = true;
        console.log('✅ Login successful for:', session.user.email);
        router.replace('/profile');
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center">Checking authentication...</div>;
  }

>>>>>>> Stashed changes
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
      />
    </div>
  );
} 