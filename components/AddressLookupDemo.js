import { useState } from 'react';

export default function AddressLookupDemo() {
  const [fields, setFields] = useState({
    streetAddress: '',
    secondaryAddress: '',
    city: '',
    state: '',
    ZIPCode: '',
    ZIPPlus4: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params = new URLSearchParams();
      Object.entries(fields).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await fetch(`/api/lookup-address?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error looking up address');
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
      <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">USPS Address Lookup Demo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="streetAddress"
          className="w-full border-2 border-blue-200 rounded px-3 py-2"
          placeholder="Street Address"
          value={fields.streetAddress}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="secondaryAddress"
          className="w-full border-2 border-blue-200 rounded px-3 py-2"
          placeholder="Secondary Address (optional)"
          value={fields.secondaryAddress}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <input
            type="text"
            name="city"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="City"
            value={fields.city}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="state"
            className="w-20 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="State"
            value={fields.state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            name="ZIPCode"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="ZIP Code (optional)"
            value={fields.ZIPCode}
            onChange={handleChange}
          />
          <input
            type="text"
            name="ZIPPlus4"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="ZIP+4 (optional)"
            value={fields.ZIPPlus4}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold shadow"
          disabled={loading}
        >
          {loading ? 'Looking up...' : 'Lookup Address'}
        </button>
      </form>
      {error && (
        <div className="mt-4 text-red-600 text-center font-semibold">
          {typeof error === 'string'
            ? error
            : <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(error, null, 2)}</pre>
          }
        </div>
      )}
      {result && (
        <div className="mt-6 bg-blue-50 p-4 rounded">
          <h3 className="font-semibold mb-2 text-blue-800">Lookup Result</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 