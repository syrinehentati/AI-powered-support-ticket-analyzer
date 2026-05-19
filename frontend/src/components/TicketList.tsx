import React, { useEffect, useState} from 'react' ;
 import { getAllTickets } from '../services/api';
 import { Ticket} from '../types';
 import AnalysisResult from './AnalysisResult';

 const severityColors: Record<string, string> = {
  low: '#27ae60',
  medium: '#f39c12',
  high: '#e67e22',
  critical: '#e74c3c',
};

function TicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selected, setSelected] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fectchTickets(){
            try {
                const data = await getAllTickets();
                setTickets(data);
            }
         catch(err) {
            setError ('Could not load tickets Make sure the backend is running.');

         } finally {
            setLoading(false);
        }
            
    }
        fectchTickets();

    },[]);

    if (loading) return (
        <p style= {{ color: '#666', textAlign:'center', padding: '2rem'}}>
            loading tickets...
        </p>
    );
 if (tickets.length === 0) return (
    <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
      No tickets yet. Analyze some tickets first or run bulk analyze.
    </p>
  );

  return (
    <div>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
      }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ textAlign: 'left', padding: '10px 12px', color: '#666', fontWeight: 600 }}>ID</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', color: '#666', fontWeight: 600 }}>Title</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', color: '#666', fontWeight: 600 }}>Severity</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', color: '#666', fontWeight: 600 }}>Category</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', color: '#666', fontWeight: 600 }}>Language</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.ticket_id}
              onClick={() => setSelected(
                selected?.ticket_id === ticket.ticket_id ? null : ticket
              )}
              style={{
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                backgroundColor: selected?.ticket_id === ticket.ticket_id
                  ? '#f8f9fa'
                  : 'transparent',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                  selected?.ticket_id === ticket.ticket_id ? '#f8f9fa' : 'transparent';
              }}
            >
              <td style={{ padding: '12px' }}>{ticket.ticket_id}</td>
              <td style={{ padding: '12px' }}>{ticket.title}</td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'white',
                  backgroundColor: severityColors[ticket.analysis?.severity || ticket.severity] || '#7f8c8d',
                }}>
                  {(ticket.analysis?.severity || ticket.severity).toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                {ticket.analysis?.category || '—'}
              </td>
              <td style={{ padding: '12px' }}>
                {ticket.analysis?.detected_language || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected?.analysis && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '0.5rem' }}>
            {selected.ticket_id} — {selected.title}
          </h3>
          <AnalysisResult analysis={selected.analysis} />
        </div>
      )}
    </div>
  );
}

export default TicketList;
