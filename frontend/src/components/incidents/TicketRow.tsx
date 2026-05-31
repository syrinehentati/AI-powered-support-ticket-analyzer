import React from 'react';
import { Ticket } from '../../types';

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
      }}
    >
      <td onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={isChecked} onChange={onCheck} />
      </td>

      <td style={{ fontSize: 12, color: '#64748b' }}>{ticket.ticket_id}</td>

      <td style={{ fontWeight: 500 }}>{ticket.title}</td>

      <td>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 12,
            color: 'white',
            background:
              ticket.analysis?.severity === 'critical'
                ? '#ef4444'
                : ticket.analysis?.severity === 'high'
                  ? '#f97316'
                  : ticket.analysis?.severity === 'medium'
                    ? '#f59e0b'
                    : '#22c55e',
          }}
        >
          {(ticket.analysis?.severity || ticket.severity).toUpperCase()}
        </span>
      </td>

      <td style={{ fontSize: 13 }}>{ticket.analysis?.category || '—'}</td>

      <td style={{ fontSize: 13 }}>
        {ticket.analysis?.detected_language || '—'}
      </td>

      <td>
        {isAdded ? (
          <span style={{ color: '#22c55e', fontSize: 12 }}>✓ Added</span>
        ) : (
          <span style={{ color: '#94a3b8' }}>—</span>
        )}
      </td>
    </tr>
  );
}

export default TicketRow;
