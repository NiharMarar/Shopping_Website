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
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full border border-blue-100 mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">Shippo Label Demo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold text-blue-600">Sender Address</legend>
          <input type="text" placeholder="Name" className="w-full mb-2" value={form.from_address.name} onChange={handleChange('from_address', 'name')} required />
          <input type="text" placeholder="Street" className="w-full mb-2" value={form.from_address.street1} onChange={handleChange('from_address', 'street1')} required />
          <input type="text" placeholder="City" className="w-full mb-2" value={form.from_address.city} onChange={handleChange('from_address', 'city')} required />
          <input type="text" placeholder="State" className="w-full mb-2" value={form.from_address.state} onChange={handleChange('from_address', 'state')} required />
          <input type="text" placeholder="ZIP" className="w-full mb-2" value={form.from_address.zip} onChange={handleChange('from_address', 'zip')} required />
          <input type="email" placeholder="Email" className="w-full mb-2" value={form.from_address.email} onChange={handleChange('from_address', 'email')} required />
          <input type="tel" placeholder="Phone" className="w-full mb-2" value={form.from_address.phone} onChange={handleChange('from_address', 'phone')} required />
        </fieldset>
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold text-blue-600">Recipient Address</legend>
          <input type="text" placeholder="Name" className="w-full mb-2" value={form.to_address.name} onChange={handleChange('to_address', 'name')} required />
          <input type="text" placeholder="Street" className="w-full mb-2" value={form.to_address.street1} onChange={handleChange('to_address', 'street1')} required />
          <input type="text" placeholder="City" className="w-full mb-2" value={form.to_address.city} onChange={handleChange('to_address', 'city')} required />
          <input type="text" placeholder="State" className="w-full mb-2" value={form.to_address.state} onChange={handleChange('to_address', 'state')} required />
          <input type="text" placeholder="ZIP" className="w-full mb-2" value={form.to_address.zip} onChange={handleChange('to_address', 'zip')} required />
        </fieldset>
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold text-blue-600">Parcel</legend>
          <input type="number" placeholder="Length (in)" className="w-full mb-2" value={form.parcel.length} onChange={handleParcelChange('length')} required min="1" />
          <input type="number" placeholder="Width (in)" className="w-full mb-2" value={form.parcel.width} onChange={handleParcelChange('width')} required min="1" />
          <input type="number" placeholder="Height (in)" className="w-full mb-2" value={form.parcel.height} onChange={handleParcelChange('height')} required min="1" />
          <input type="number" placeholder="Weight (oz)" className="w-full mb-2" value={form.parcel.weight} onChange={handleParcelChange('weight')} required min="1" />
        </fieldset>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold shadow" disabled={loading}>
          {loading ? 'Creating Label...' : 'Create Label'}
        </button>
      </form>
      {error && (
        <div className="mt-4 text-red-600 text-center font-semibold">
          {typeof error === 'string' ? error : <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(error, null, 2)}</pre>}
        </div>
      )}
      {result && (
        <div className="mt-6 bg-blue-50 p-4 rounded">
          <h3 className="font-semibold mb-2 text-blue-800">Label Created</h3>
          <div className="mb-2">Tracking Number: <span className="font-mono">{result.tracking_number}</span></div>
          <a href={result.label_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold">Download Label (PDF)</a>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto mt-4">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 