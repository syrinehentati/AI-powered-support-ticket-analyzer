import React from 'react';
import { Ticket } from '../../types';
import AnalysisResult from '../analyze/AnalysisResult';

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

function TicketDetailPanel({ ticket, onClose }: Props) {
  if (!ticket.analysis) return null;

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        background: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 15 }}>
          {ticket.ticket_id} — {ticket.title}
        </h3>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 18,
            color: '#94a3b8',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <AnalysisResult analysis={ticket.analysis} />
    </div>
  );
}

export default TicketDetailPanel;