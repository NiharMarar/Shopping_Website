import React, { useEffect } from 'react';

export default function Toast({ message, visible, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
        {message}
      </div>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 