// USPS ENUMS for Domestic Pricing
// mailClass: USPS_RETAIL_GROUND, PARCEL_SELECT, PRIORITY_MAIL, PRIORITY_MAIL_EXPRESS, FIRST-CLASS_PACKAGE_SERVICE, etc.
// processingCategory: LETTERS, FLATS, MACHINABLE, IRREGULAR, NON_MACHINABLE, NONSTANDARD
// destinationEntryFacilityType: NONE, DESTINATION_NETWORK_DISTRIBUTION_CENTER, DESTINATION_SECTIONAL_CENTER_FACILITY, DESTINATION_DELIVERY_UNIT, DESTINATION_SERVICE_HUB
// rateIndicator: RETAIL (for demo), see docs for more
// priceType: RETAIL, COMMERCIAL, CONTRACT, NSA

import { useState } from 'react';

export default function DomesticPricingDemo() {
  const [form, setForm] = useState({
    originZIPCode: '',
    destinationZIPCode: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    mailClass: 'USPS_RETAIL_GROUND',
    processingCategory: 'MACHINABLE',
    destinationEntryFacilityType: 'NONE',
    rateIndicator: '3D', // 3D = Retail Single-Piece (see USPS docs for more)
    priceType: 'RETAIL',
    mailingDate: new Date().toISOString().slice(0, 10),
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/domestic-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error fetching rates');
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
      <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">USPS Domestic Pricing Demo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            name="originZIPCode"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="From ZIP"
            value={form.originZIPCode}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="destinationZIPCode"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="To ZIP"
            value={form.destinationZIPCode}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            name="weight"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="Weight (oz)"
            value={form.weight}
            onChange={handleChange}
            required
            min="1"
          />
          <input
            type="number"
            name="length"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="Length (in)"
            value={form.length}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            name="width"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="Width (in)"
            value={form.width}
            onChange={handleChange}
            required
            min="1"
          />
          <input
            type="number"
            name="height"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            placeholder="Height (in)"
            value={form.height}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div className="flex gap-2">
          <select
            name="mailClass"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            value={form.mailClass}
            onChange={handleChange}
          >
            <option value="USPS_RETAIL_GROUND">USPS Retail Ground</option>
            <option value="PARCEL_SELECT">Parcel Select</option>
            <option value="PRIORITY_MAIL">Priority Mail</option>
            <option value="PRIORITY_MAIL_EXPRESS">Priority Mail Express</option>
            <option value="FIRST-CLASS_PACKAGE_SERVICE">First-Class Package Service</option>
            <option value="MEDIA_MAIL">Media Mail</option>
            <option value="LIBRARY_MAIL">Library Mail</option>
            <option value="BOUND_PRINTED_MATTER">Bound Printed Matter</option>
            <option value="USPS_GROUND_ADVANTAGE">USPS Ground Advantage</option>
          </select>
          <select
            name="processingCategory"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            value={form.processingCategory}
            onChange={handleChange}
          >
            <option value="LETTERS">Letters</option>
            <option value="FLATS">Flats</option>
            <option value="MACHINABLE">Machinable</option>
            <option value="IRREGULAR">Irregular</option>
            <option value="NON_MACHINABLE">Non-Machinable</option>
            <option value="NONSTANDARD">Nonstandard</option>
          </select>
        </div>
        <div className="flex gap-2">
          <select
            name="destinationEntryFacilityType"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            value={form.destinationEntryFacilityType}
            onChange={handleChange}
          >
            <option value="NONE">None</option>
            <option value="DESTINATION_NETWORK_DISTRIBUTION_CENTER">NDC</option>
            <option value="DESTINATION_SECTIONAL_CENTER_FACILITY">SCF</option>
            <option value="DESTINATION_DELIVERY_UNIT">DDU</option>
            <option value="DESTINATION_SERVICE_HUB">Service Hub</option>
          </select>
          <select
            name="rateIndicator"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            value={form.rateIndicator}
            onChange={handleChange}
          >
            <option value="3D">Retail Single-Piece (3D)</option>
            {/* Add more as needed: 3N, 3R, etc. See USPS docs */}
          </select>
        </div>
        <div className="flex gap-2">
          <select
            name="priceType"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            value={form.priceType}
            onChange={handleChange}
          >
            <option value="RETAIL">Retail</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="CONTRACT">Contract</option>
            <option value="NSA">NSA</option>
          </select>
          <input
            type="date"
            name="mailingDate"
            className="flex-1 border-2 border-blue-200 rounded px-3 py-2"
            value={form.mailingDate}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold shadow"
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Get Rates'}
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
          <h3 className="font-semibold mb-2 text-blue-800">Rate Result</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 