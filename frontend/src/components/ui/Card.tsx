import React from 'react';

interface CardProps {
  children: React.ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {children}
    </div>
  );
}