import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import '../styles/globals.css';

const AuthProvider = dynamic(
  () => import('../lib/AuthContext').then(mod => mod.AuthProvider),
  { ssr: false }
);

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
