import { useState } from 'react';

export default function ShippoLabelDemo() {
  const [form, setForm] = useState({
    from_address: {
      name: '',
      street1: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      email: '',
      phone: '',
    },
    to_address: {
      name: '',
      street1: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
    },
    parcel: {
      length: '',
      width: '',
      height: '',
      distance_unit: 'in',
      weight: '',
      mass_unit: 'oz',
    },
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (section, field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: e.target.value,
      },
    }));
  };

  const handleParcelChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      parcel: {
        ...prev.parcel,
        [field]: e.target.value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/create-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error creating label');
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
    <div className="bg-cyberpunk-surface p-8 rounded-xl shadow-neon max-w-lg w-full border border-cyberpunk-neonBlue mx-auto mt-8">
      <h2 className="text-2xl font-nexus font-bold mb-4 text-cyberpunk-neonBlue text-center drop-shadow-[0_0_8px_#00ffe7]">Shippo Label Demo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="border p-4 rounded border-cyberpunk-neonBlue">
          <legend className="font-semibold text-cyberpunk-neonPink font-nexus">Sender Address</legend>
          <input type="text" placeholder="Name" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.from_address.name} onChange={handleChange('from_address', 'name')} required />
          <input type="text" placeholder="Street" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.from_address.street1} onChange={handleChange('from_address', 'street1')} required />
          <input type="text" placeholder="City" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.from_address.city} onChange={handleChange('from_address', 'city')} required />
          <input type="text" placeholder="State" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.from_address.state} onChange={handleChange('from_address', 'state')} required />
          <input type="text" placeholder="ZIP" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.from_address.zip} onChange={handleChange('from_address', 'zip')} required />
          <input type="email" placeholder="Email" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.from_address.email} onChange={handleChange('from_address', 'email')} required />
          <input type="tel" placeholder="Phone" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.from_address.phone} onChange={handleChange('from_address', 'phone')} required />
        </fieldset>
        <fieldset className="border p-4 rounded border-cyberpunk-neonBlue">
          <legend className="font-semibold text-cyberpunk-neonPink font-nexus">Recipient Address</legend>
          <input type="text" placeholder="Name" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.to_address.name} onChange={handleChange('to_address', 'name')} required />
          <input type="text" placeholder="Street" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.to_address.street1} onChange={handleChange('to_address', 'street1')} required />
          <input type="text" placeholder="City" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.to_address.city} onChange={handleChange('to_address', 'city')} required />
          <input type="text" placeholder="State" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.to_address.state} onChange={handleChange('to_address', 'state')} required />
          <input type="text" placeholder="ZIP" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.to_address.zip} onChange={handleChange('to_address', 'zip')} required />
        </fieldset>
        <fieldset className="border p-4 rounded border-cyberpunk-neonBlue">
          <legend className="font-semibold text-cyberpunk-neonPink font-nexus">Parcel</legend>
          <input type="number" placeholder="Length (in)" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.parcel.length} onChange={handleParcelChange('length')} required min="1" />
          <input type="number" placeholder="Width (in)" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.parcel.width} onChange={handleParcelChange('width')} required min="1" />
          <input type="number" placeholder="Height (in)" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.parcel.height} onChange={handleParcelChange('height')} required min="1" />
          <input type="number" placeholder="Weight (oz)" className="w-full mb-2 border-2 border-cyberpunk-neonBlue rounded px-3 py-2 bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus" value={form.parcel.weight} onChange={handleParcelChange('weight')} required min="1" />
        </fieldset>
        <button type="submit" className="w-full bg-cyberpunk-neonBlue text-cyberpunk-bg py-2 rounded hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg font-nexus font-semibold shadow-neon border border-cyberpunk-neonPink transition-colors" disabled={loading}>
          {loading ? 'Creating Label...' : 'Create Label'}
        </button>
      </form>
      {error && (
        <div className="mt-4 text-cyberpunk-neonPink text-center font-semibold font-nexus">
          {typeof error === 'string' ? error : <pre className="text-xs bg-cyberpunk-bg p-2 rounded overflow-x-auto border border-cyberpunk-neonPink text-cyberpunk-neonBlue">{JSON.stringify(error, null, 2)}</pre>}
        </div>
      )}
      {result && (
        <div className="mt-6 bg-cyberpunk-bg p-4 rounded border border-cyberpunk-neonBlue">
          <h3 className="font-semibold mb-2 text-cyberpunk-neonPurple font-nexus">Label Created</h3>
          <div className="mb-2 text-cyberpunk-neonBlue">Tracking Number: <span className="font-mono">{result.tracking_number}</span></div>
          <a href={result.label_url} target="_blank" rel="noopener noreferrer" className="text-cyberpunk-neonPink underline font-semibold font-nexus">Download Label (PDF)</a>
          <pre className="text-xs bg-cyberpunk-surface p-2 rounded overflow-x-auto mt-4 text-cyberpunk-neonBlue">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 