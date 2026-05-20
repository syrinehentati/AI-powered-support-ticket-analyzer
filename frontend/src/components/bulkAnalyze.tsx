import React, { useState } from 'react';
import { bulkAnalyze } from '../services/api';
import { Ticket } from '../types';
import AnalysisResult from './AnalysisResult';

function BulkAnalyze() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [progress, setProgress] = useState(0);

  async function handleBulkAnalyze() {
    setLoading(true);
    setError(null);
    setTickets([]);
    setProgress(0);
    setSelected(null);

    try {
      const results = await bulkAnalyze();
      setTickets(results);
      setProgress(100);
    } catch (err: any) {
      setError('Bulk analyze failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>

      {/* header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '14px' }}>
          Analyzes all 13 mock tickets at once — English, French, Arabic and German.
        </p>
        <button
          onClick={handleBulkAnalyze}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#bbb' : '#2c3e50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Analyzing all tickets...' : 'Run Bulk Analysis'}
        </button>
      </div>

      {/* loading indicator */}
      {loading && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
            Processing 13 tickets. This takes about 30 seconds...
          </p>
          <div style={{
            height: '6px',
            backgroundColor: '#e0e0e0',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: '100%',
              backgroundColor: '#2c3e50',
              borderRadius: '3px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
          <style>{`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.4; }
              100% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* error */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fdecea',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          color: '#c0392b',
          fontSize: '14px',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      {/* results summary */}
      {tickets.length > 0 && (
        <div>
          <p style={{ fontSize: '14px', color: '#27ae60', fontWeight: 600, marginBottom: '1rem' }}>
            ✓ {tickets.length} tickets analyzed successfully
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#666', fontWeight: 600 }}>ID</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#666', fontWeight: 600 }}>Title</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#666', fontWeight: 600 }}>Language</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#666', fontWeight: 600 }}>Category</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#666', fontWeight: 600 }}>Severity</th>
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
                >
                  <td style={{ padding: '12px' }}>{ticket.ticket_id}</td>
                  <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket.title}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {ticket.analysis?.detected_language || '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {ticket.analysis?.category || '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'white',
                      backgroundColor: {
                        low: '#27ae60',
                        medium: '#f39c12',
                        high: '#e67e22',
                        critical: '#e74c3c',
                      }[ticket.analysis?.severity || ticket.severity] || '#7f8c8d',
                    }}>
                      {(ticket.analysis?.severity || ticket.severity).toUpperCase()}
                    </span>
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
      )}

    </div>
  );
}

export default BulkAnalyze;