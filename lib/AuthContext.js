import { createContext, useContext, useEffect, useState } from 'react';

console.log('🚨 AuthContext.js: Module loaded and executed');

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

<<<<<<< Updated upstream
  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    router.push('/');
  };

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    router.push('/login?message=Check your email to confirm your account');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/login');
  };

=======
  console.log('🚨 AuthProvider: State initialized - user:', user?.email, 'loading:', loading);

  // Test useEffect - this should definitely run
  useEffect(() => {
    console.log('🚨 AuthProvider: BASIC useEffect TRIGGERED!');
    console.log('🚨 AuthProvider: About to setLoading(false)');
    setLoading(false);
    console.log('🚨 AuthProvider: setLoading(false) completed');
  }, []);

  // Test useEffect with a simple console log
  useEffect(() => {
    console.log('🚨 AuthProvider: SECOND useEffect TRIGGERED!');
  }, []);

  // Test useEffect with a dependency
  useEffect(() => {
    console.log('🚨 AuthProvider: THIRD useEffect TRIGGERED! loading changed to:', loading);
  }, [loading]);

  // Simplified functions
  const signIn = async (email, password) => {
    console.log('🚨 AuthProvider: signIn function called with email:', email);
    setUser({ email });
    setLoading(false);
  };

  const signUp = async (email, password) => {
    console.log('🚨 AuthProvider: signUp function called with email:', email);
  };

  const signOut = async () => {
    console.log('🚨 AuthProvider: signOut function called');
    setUser(null);
  };

  console.log('🚨 AuthProvider: About to return JSX - user:', user?.email, 'loading:', loading);

>>>>>>> Stashed changes
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 