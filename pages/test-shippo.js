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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Shippo API Test</h1>
      
      <button
        onClick={testShippo}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Shippo API'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <pre className="mt-2 text-sm">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">Success!</h3>
          <p className="mt-2">Tracking Number: {result.tracking_number}</p>
          <p>Label URL: <a href={result.label_url} target="_blank" rel="noopener noreferrer" className="underline">View Label</a></p>
          <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 