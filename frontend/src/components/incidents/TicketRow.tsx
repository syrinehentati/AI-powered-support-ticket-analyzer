import React from 'react';
import { Ticket } from '../../types';

const severityColors: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

const categoryColors: Record<string, string> = {
  authentication: '#8e44ad',
  performance: '#2980b9',
  network: '#16a085',
  crash: '#c0392b',
  configuration: '#d35400',
  other: '#7f8c8d',
};

interface Props {
  ticket: Ticket;
  isSelected: boolean;
  isChecked: boolean;
  isAdded: boolean;
  onSelect: () => void;
  onCheck: () => void;
}

function TicketRow({
  ticket,
  isSelected,
  isChecked,
  isAdded,
  onSelect,
  onCheck,
}: Props) {
  return (
    <tr
      onClick={onSelect}
      style={{
        borderTop: '1px solid #e2e8f0',
        background: isSelected ? '#f1f5f9' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.background = isSelected
          ? '#f1f5f9'
          : 'transparent';
      }}
    >
      {/* checkbox */}
      <td
        style={{ padding: '12px 10px', width: 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        <input type="checkbox" checked={isChecked} onChange={onCheck} />
      </td>

      {/* id */}
      <td style={{ padding: '12px 10px', fontSize: 13, color: '#64748b' }}>
        {ticket.ticket_id}
      </td>

      {/* title */}
      <td style={{ padding: '12px 10px', fontSize: 14, fontWeight: 500 }}>
        {ticket.title}
      </td>

      {/* severity badge */}
      <td style={{ padding: '12px 10px' }}>
        <span
          style={{
            padding: '5px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            color: 'white',
            backgroundColor:
              severityColors[ticket.analysis?.severity || ticket.severity] ||
              '#7f8c8d',
          }}
        >
          {(ticket.analysis?.severity || ticket.severity).toLowerCase()}
        </span>
      </td>

      {/* category badge */}
      <td style={{ padding: '12px 10px' }}>
        {ticket.analysis?.category ? (
          <span
            style={{
              padding: '5px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              color: 'white',
              backgroundColor:
                categoryColors[ticket.analysis.category] || '#7f8c8d',
            }}
          >
            {ticket.analysis.category.toLowerCase()}
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>—</span>
        )}
      </td>

      {/* language */}
      <td style={{ padding: '12px 10px', fontSize: 13, color: '#475569' }}>
        {ticket.analysis?.detected_language || '—'}
      </td>

      {/* kb status */}
      <td style={{ padding: '12px 10px' }}>
        {isAdded ? (
          <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>
            ✓ Added
          </span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
        )}
      </td>
    </tr>
  );
}

export default TicketRow;
