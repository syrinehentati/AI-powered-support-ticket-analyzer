import React from 'react';
import Card from './Card';

interface KPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function KPI({
  title,
  value,
  subtitle,
}: KPIProps) {
  return (
    <Card>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '8px',
          }}
        >
          {title}
        </p>

        <h2
          style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          {value}
        </h2>

        {subtitle && (
          <p
            style={{
              marginTop: '8px',
              marginBottom: 0,
              fontSize: '13px',
              color: '#94a3b8',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}