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
    <div className="bg-cyberpunk-surface p-8 rounded-xl shadow-neon max-w-md w-full border border-cyberpunk-neonBlue mx-auto mt-8">
      <h2 className="text-2xl font-nexus font-bold mb-4 text-cyberpunk-neonBlue text-center drop-shadow-[0_0_8px_#00ffe7]">USPS Address Lookup Demo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="streetAddress"
          className="w-full border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
          placeholder="Street Address"
          value={fields.streetAddress}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="secondaryAddress"
          className="w-full border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
          placeholder="Secondary Address (optional)"
          value={fields.secondaryAddress}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <input
            type="text"
            name="city"
            className="flex-1 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
            placeholder="City"
            value={fields.city}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="state"
            className="w-20 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
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
            className="flex-1 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
            placeholder="ZIP Code (optional)"
            value={fields.ZIPCode}
            onChange={handleChange}
          />
          <input
            type="text"
            name="ZIPPlus4"
            className="flex-1 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
            placeholder="ZIP+4 (optional)"
            value={fields.ZIPPlus4}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyberpunk-neonBlue text-cyberpunk-bg py-2 rounded hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg font-nexus font-semibold shadow-neon border border-cyberpunk-neonPink transition-colors"
          disabled={loading}
        >
          {loading ? 'Looking up...' : 'Lookup Address'}
        </button>
      </form>
      {error && (
        <div className="mt-4 text-cyberpunk-neonPink text-center font-semibold font-nexus">
          {typeof error === 'string'
            ? error
            : <pre className="text-xs bg-cyberpunk-bg p-2 rounded overflow-x-auto border border-cyberpunk-neonPink text-cyberpunk-neonBlue">{JSON.stringify(error, null, 2)}</pre>
          }
        </div>
      )}
      {result && (
        <div className="mt-6 bg-cyberpunk-bg p-4 rounded border border-cyberpunk-neonBlue">
          <h3 className="font-semibold mb-2 text-cyberpunk-neonPurple font-nexus">Lookup Result</h3>
          <pre className="text-xs bg-cyberpunk-surface p-2 rounded overflow-x-auto text-cyberpunk-neonBlue">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 