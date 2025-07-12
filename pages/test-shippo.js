import { useState } from 'react';

export default function TestShippo() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testShippo = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-shippo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Test failed');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyberpunk-bg flex flex-col items-center justify-center p-4">
      <div className="bg-cyberpunk-surface p-8 rounded-xl shadow-neon max-w-4xl w-full border border-cyberpunk-neonBlue">
        <h1 className="text-2xl font-nexus font-bold mb-4 text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7]">Shippo API Test</h1>
        <button
          onClick={testShippo}
          disabled={loading}
          className="bg-cyberpunk-neonBlue text-cyberpunk-bg px-4 py-2 rounded font-nexus font-bold hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg shadow-neon border border-cyberpunk-neonPink transition-colors"
        >
          {loading ? 'Testing...' : 'Test Shippo API'}
        </button>
        {error && (
          <div className="mt-4 p-4 bg-cyberpunk-bg border border-cyberpunk-neonPink text-cyberpunk-neonPink rounded font-nexus">
            <h3 className="font-bold">Error:</h3>
            <pre className="mt-2 text-sm">{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
        {result && (
          <div className="mt-4 p-4 bg-cyberpunk-bg border border-cyberpunk-neonBlue text-cyberpunk-neonBlue rounded font-nexus">
            <h3 className="font-bold">Success!</h3>
            <p className="mt-2">Tracking Number: {result.tracking_number}</p>
            <p>Label URL: <a href={result.label_url} target="_blank" rel="noopener noreferrer" className="underline text-cyberpunk-neonPink">View Label</a></p>
            <pre className="mt-2 text-sm bg-cyberpunk-surface p-2 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 