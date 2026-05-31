import React, { useEffect, useState } from 'react';

export default function NetworkErrorBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onError() { setVisible(true); }
    function onRecover() { setVisible(false); }

    window.addEventListener('app:network-error', onError);
    window.addEventListener('app:network-recover', onRecover);
    return () => {
      window.removeEventListener('app:network-error', onError);
      window.removeEventListener('app:network-recover', onRecover);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#c0392b',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <span>
        ⚠️ Cannot reach the server — check that the backend is running on{' '}
        <code style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: 4 }}>
          {process.env.REACT_APP_API_URL || 'your API URL'}
        </code>
      </span>
      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          lineHeight: 1,
          padding: '0 4px',
        }}
      >
        ×
      </button>
    </div>
  );
}