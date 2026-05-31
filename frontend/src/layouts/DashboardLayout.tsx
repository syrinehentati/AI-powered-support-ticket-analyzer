import React from 'react';

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function DashboardLayout({
  title,
  description,
  children,
}: Props) {
  return (
    <div>
      <div
        style={{
          marginBottom: '24px',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          {title}
        </h1>

        {description && (
          <p
            style={{
              marginTop: '8px',
              color: '#64748b',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}