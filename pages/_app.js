'use client';

import Layout from '../components/Layout';
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import { CartProvider } from '../lib/CartContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}

export default MyApp;
