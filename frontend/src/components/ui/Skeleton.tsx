import React from 'react';

export default function Skeleton({ height = 16 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 8,
        background: 'linear-gradient(90deg,#eee,#f5f5f5,#eee)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.2s infinite',
      }}
    />
  );
}
