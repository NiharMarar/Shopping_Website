<<<<<<< Updated upstream
=======
'use client';

import Layout from '../components/Layout';
>>>>>>> Stashed changes
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';

<<<<<<< Updated upstream
export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
=======
function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
>>>>>>> Stashed changes
  );
}
