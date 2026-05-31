import React from 'react';

interface BadgeProps {
  label: string;
  color?: string;
}

export default function Badge({
  label,
  color = '#2563eb',
}: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        color: 'white',
        background: color,
      }}
    >
      {label}
    </span>
  );
}