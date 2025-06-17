import Head from 'next/head';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <>
      <Head>
        <title>Your Shop</title>
      </Head>
      <main className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center py-8">Welcome to Your Shop</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </main>
    </>
  );
}
