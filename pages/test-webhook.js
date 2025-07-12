import { useState } from 'react';
import Head from 'next/head';

export default function TestWebhook() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [status, setStatus] = useState('IN_TRANSIT');
  const [result, setResult] = useState('');

  const testWebhook = async () => {
    if (!trackingNumber) {
      setResult('Please enter a tracking number');
      return;
    }

    const webhookData = {
      event: 'track_updated',
      data: {
        tracking_number: trackingNumber,
        tracking_status: {
          status: status,
          tracking_history: [
            {
              status: status,
              status_details: 'Test status update',
              location: 'Test Location',
              timestamp: new Date().toISOString()
            }
          ]
        }
      }
    };

    try {
      const response = await fetch('/api/webhooks/shippo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      const data = await response.json();
      setResult(`Webhook test result: ${response.status} - ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Head>
        <title>Test Webhook - YourShop</title>
      </Head>

      <div className="min-h-screen bg-cyberpunk-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-cyberpunk-surface p-8 rounded-lg shadow-neon border border-cyberpunk-neonBlue">
            <h1 className="text-3xl font-nexus font-bold mb-6 text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7]">Test Webhook</h1>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-nexus font-medium text-cyberpunk-neonPink mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number from your database"
                  className="w-full p-2 border border-cyberpunk-neonBlue rounded-md bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus"
                />
              </div>

              <div>
                <label className="block text-sm font-nexus font-medium text-cyberpunk-neonPink mb-2">Tracking Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border border-cyberpunk-neonBlue rounded-md bg-cyberpunk-bg text-cyberpunk-neonBlue font-nexus"
                >
                  <option value="SHIPPED">Shipped</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              <button
                onClick={testWebhook}
                className="bg-cyberpunk-neonBlue text-cyberpunk-bg px-4 py-2 rounded-md font-nexus font-bold hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg shadow-neon border border-cyberpunk-neonPink transition-colors"
              >
                Test Webhook
              </button>

              {result && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                  <h3 className="font-medium mb-2">Result:</h3>
                  <pre className="text-sm overflow-auto">{result}</pre>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="font-medium text-yellow-800 mb-2">How to Test:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                <li>Create an order through your website</li>
                <li>Copy the tracking number from the order</li>
                <li>Enter it above and select a status</li>
                <li>Click "Test Webhook" to simulate a status update</li>
                <li>Check your email for the tracking notification</li>
                <li>Check your terminal logs for webhook processing</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 