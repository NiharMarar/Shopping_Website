'use client';

import Layout from '../components/Layout';
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import { CartProvider } from '../lib/CartContext';
import { LikesProvider } from '../lib/LikesContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <LikesProvider>
        <CartProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CartProvider>
      </LikesProvider>
    </AuthProvider>
  );
}

export default MyApp;
