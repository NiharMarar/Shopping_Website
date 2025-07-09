import { useState } from 'react';

function TrackingResult({ result }) {
  // USPS API response structure may vary; adjust as needed
  const summary = result?.trackResponse?.shipment || result?.trackResponse?.shipments || result?.trackResponse;
  const shipment = Array.isArray(summary) ? summary[0] : summary;
  const trackingInfo = shipment?.trackingInfo || shipment?.tracking;
  const events = trackingInfo?.events || trackingInfo?.event || [];

  return (
    <div className="mt-6 bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-2 text-blue-700">Tracking Details</h2>
      <div className="mb-2">
        <span className="font-semibold">Tracking Number:</span> {trackingInfo?.trackingNumber || shipment?.trackingNumber || 'N/A'}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Status:</span> {trackingInfo?.status || trackingInfo?.statusDescription || 'N/A'}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Service:</span> {trackingInfo?.service || trackingInfo?.serviceType || 'N/A'}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Expected Delivery:</span> {trackingInfo?.expectedDeliveryDate || trackingInfo?.expectedDelivery || 'N/A'}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Last Updated:</span> {events[0]?.eventDateTime || events[0]?.eventDate || 'N/A'}
      </div>
      <div className="mt-4">
        <h3 className="font-semibold mb-1">Tracking History:</h3>
        <div className="max-h-48 overflow-y-auto">
          {Array.isArray(events) && events.length > 0 ? (
            <ul className="space-y-2">
              {events.map((ev, idx) => (
                <li key={idx} className="border-l-4 border-blue-400 pl-2">
                  <div className="text-sm text-gray-800">{ev.eventDescription || ev.event || 'Event'}</div>
                  <div className="text-xs text-gray-500">{ev.eventDateTime || ev.eventDate || ''} {ev.eventTime || ''}</div>
                  <div className="text-xs text-gray-500">{ev.eventCity || ''} {ev.eventState || ''} {ev.eventZIPCode || ''}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm">No tracking history available.</div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <details>
          <summary className="cursor-pointer text-blue-600 hover:underline">Raw API Response</summary>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs mt-2">{JSON.stringify(result, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/track-usps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error fetching tracking info');
      } else {
        setResult(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTrackingNumber('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-blue-100">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700">USPS Tracking</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full border-2 border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter USPS Tracking Number"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            required
            disabled={loading}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold shadow"
              disabled={loading || !trackingNumber}
            >
              {loading ? 'Tracking...' : 'Track Package'}
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 font-semibold shadow"
              onClick={handleClear}
              disabled={loading && !result && !error}
            >
              Clear
            </button>
          </div>
        </form>
        {error && <div className="mt-4 text-red-600 text-center font-semibold">{error}</div>}
        {result && <TrackingResult result={result} />}
      </div>
      <div className="mt-8 text-center text-xs text-gray-500 max-w-md">
        <p>Note: This is a demo using the USPS <b>test environment</b>. Use a valid USPS tracking number for best results.</p>
      </div>
    </div>
  );
} 