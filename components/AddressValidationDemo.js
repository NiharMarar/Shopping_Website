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
    <div className="bg-cyberpunk-surface p-8 rounded-xl shadow-neon max-w-md w-full border border-cyberpunk-neonBlue mx-auto mt-8">
      <h2 className="text-2xl font-nexus font-bold mb-4 text-cyberpunk-neonBlue text-center drop-shadow-[0_0_8px_#00ffe7]">USPS Address Validation Demo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="addressLine1"
          className="w-full border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
          placeholder="Address Line 1"
          value={address.addressLine1}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="addressLine2"
          className="w-full border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
          placeholder="Address Line 2 (optional)"
          value={address.addressLine2}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <input
            type="text"
            name="city"
            className="flex-1 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
            placeholder="City"
            value={address.city}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="state"
            className="w-20 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
            placeholder="State"
            value={address.state}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="zip"
            className="w-24 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
            placeholder="ZIP"
            value={address.zip}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyberpunk-neonBlue text-cyberpunk-bg py-2 rounded hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg font-nexus font-semibold shadow-neon border border-cyberpunk-neonPink transition-colors"
          disabled={loading}
        >
          {loading ? 'Validating...' : 'Validate Address'}
        </button>
      </form>
      {error && <div className="mt-4 text-cyberpunk-neonPink text-center font-semibold font-nexus">{error}</div>}
      {result && (
        <div className="mt-6 bg-cyberpunk-bg p-4 rounded border border-cyberpunk-neonBlue">
          <h3 className="font-semibold mb-2 text-cyberpunk-neonPurple font-nexus">Validation Result</h3>
          <pre className="text-xs bg-cyberpunk-surface p-2 rounded overflow-x-auto text-cyberpunk-neonBlue">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 