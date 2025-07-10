import { useState } from 'react';

export default function AddressValidationDemo() {
  const [address, setAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error validating address');
      } else {
        setResult(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-blue-100 mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">USPS Address Validation Demo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="addressLine1"
          className="w-full border-2 border-blue-200 rounded px-3 py-2"
          placeholder="Address Line 1"
          value={address.addressLine1}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="addressLine2"
          className="w-full border-2 border-blue-200 rounded px-3 py-2"
          placeholder="Address Line 2 (optional)"
          value={address.addressLine2}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <input
            type="text"
            name="city"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="City"
            value={address.city}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="state"
            className="w-20 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="State"
            value={address.state}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="zip"
            className="w-24 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="ZIP"
            value={address.zip}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold shadow"
          disabled={loading}
        >
          {loading ? 'Validating...' : 'Validate Address'}
        </button>
      </form>
      {error && <div className="mt-4 text-red-600 text-center font-semibold">{error}</div>}
      {result && (
        <div className="mt-6 bg-blue-50 p-4 rounded">
          <h3 className="font-semibold mb-2 text-blue-800">Validation Result</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 