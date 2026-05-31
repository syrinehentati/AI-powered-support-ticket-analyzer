import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
}: SearchBarProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <Search
        size={18}
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
        }}
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 12px 12px 40px',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          outline: 'none',
          fontSize: '14px',
        }}
      />
    </div>
  );
}