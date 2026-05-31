import React from 'react';

export default function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 14,
        background: '#fff1f2',
        border: '1px solid #fecdd3',
      }}
    >
      <p style={{ margin: 0, color: '#be123c', fontWeight: 600 }}>
        Something went wrong
      </p>

      <p style={{ marginTop: 6, color: '#9f1239', fontSize: 13 }}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 12,
            padding: '8px 14px',
            background: '#be123c',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}