import React, { useCallback, useEffect, useState } from 'react';
import { addToKnowledgeBase, getAllTickets } from '../services/api';
import { Ticket } from '../types';
import AnalysisResult from './AnalysisResult';

const severityColors: Record<string, string> = {
  low: '#27ae60',
  medium: '#f39c12',
  high: '#e67e22',
  critical: '#e74c3c',
};

const categoryColors: Record<string, string> = {
  authentication: '#8e44ad',
  performance: '#2980b9',
  network: '#16a085',
  crash: '#c0392b',
  configuration: '#d35400',
  other: '#7f8c8d',
};

function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTickets();
      setTickets(data);
    } catch (err) {
      setError('Could not load tickets. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  function toggleCheck(ticketId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ticketId)) {
        next.delete(ticketId);
      } else {
        next.add(ticketId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (checkedIds.size === tickets.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(tickets.map((t) => t.ticket_id)));
    }
  }

  async function handleAddToKnowledgeBase() {
    const toAdd = tickets.filter(
      (t) => checkedIds.has(t.ticket_id) && !addedIds.has(t.ticket_id)
    );

    if (toAdd.length === 0) return;

    setAdding(true);
    const newlyAdded = new Set(addedIds);

    for (const ticket of toAdd) {
      if (!ticket.analysis) continue;
      try {
        await addToKnowledgeBase({
          ticket_id: ticket.ticket_id,
          title: ticket.title,
          description: ticket.description,
          logs: ticket.logs,
          resolution: ticket.analysis.resolution,
          category: ticket.analysis.category,
          severity: ticket.analysis.severity,
          detected_language: ticket.analysis.detected_language,
        });
        newlyAdded.add(ticket.ticket_id);
      } catch (err) {
        // skip failed ones silently
      }
    }

    setAddedIds(new Set(newlyAdded));
    setCheckedIds(new Set());
    setAdding(false);
  }

  const selectedCount = checkedIds.size;
  const alreadyAddedCount = [...checkedIds].filter((id) =>
    addedIds.has(id)
  ).length;
  const newToAddCount = selectedCount - alreadyAddedCount;

  // ─── early returns ───────────────────────────────────────────

  if (loading)
    return (
      <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
        Loading tickets...
      </p>
    );

  if (error)
    return (
      <p style={{ color: '#c0392b', textAlign: 'center', padding: '2rem' }}>
        {error}
      </p>
    );

  if (tickets.length === 0)
    return (
      <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
        No tickets yet. Analyze some tickets first or run bulk analyze.
      </p>
    );

  // ─── render ──────────────────────────────────────────────────

  return (
    <div>

      {/* knowledge base toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
          padding: '10px 12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #e0e0e0',
        }}
      >
        <span style={{ fontSize: '13px', color: '#666' }}>
          {selectedCount === 0
            ? 'Select tickets to add to knowledge base'
            : `${selectedCount} selected${
                newToAddCount > 0
                  ? ` — ${newToAddCount} new`
                  : ' — all already added'
              }`}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            onClick={toggleSelectAll}
            style={{
              padding: '6px 14px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              backgroundColor: 'white',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {checkedIds.size === tickets.length ? 'Deselect all' : 'Select all'}
          </button>
          <button
            onClick={handleAddToKnowledgeBase}
            disabled={adding || newToAddCount === 0}
            style={{
              padding: '6px 14px',
              backgroundColor:
                adding || newToAddCount === 0 ? '#bbb' : '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor:
                adding || newToAddCount === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {adding
              ? 'Adding...'
              : `+ Add ${newToAddCount > 0 ? newToAddCount : ''} to Knowledge Base`}
          </button>
        </div>
      </div>

      {/* table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ padding: '10px 12px', width: '40px' }}>
              <input
                type="checkbox"
                checked={
                  tickets.length > 0 && checkedIds.size === tickets.length
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                color: '#666',
                fontWeight: 600,
              }}
            >
              ID
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                color: '#666',
                fontWeight: 600,
              }}
            >
              Title
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                color: '#666',
                fontWeight: 600,
              }}
            >
              Severity
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                color: '#666',
                fontWeight: 600,
              }}
            >
              Category
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                color: '#666',
                fontWeight: 600,
              }}
            >
              Language
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                color: '#666',
                fontWeight: 600,
              }}
            >
              KB
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.ticket_id}
              onClick={() =>
                setSelected(
                  selected?.ticket_id === ticket.ticket_id ? null : ticket
                )
              }
              style={{
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                backgroundColor:
                  selected?.ticket_id === ticket.ticket_id
                    ? '#f8f9fa'
                    : 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                  '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                  selected?.ticket_id === ticket.ticket_id
                    ? '#f8f9fa'
                    : 'transparent';
              }}
            >
              {/* checkbox — stopPropagation so clicking it doesn't open detail */}
              <td
                style={{ padding: '12px', width: '40px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={checkedIds.has(ticket.ticket_id)}
                  onChange={() => toggleCheck(ticket.ticket_id)}
                />
              </td>

              <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                {ticket.ticket_id}
              </td>

              <td
                style={{
                  padding: '12px',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {ticket.title}
              </td>

              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor:
                      severityColors[
                        ticket.analysis?.severity || ticket.severity
                      ] || '#7f8c8d',
                  }}
                >
                  {(
                    ticket.analysis?.severity || ticket.severity
                  ).toUpperCase()}
                </span>
              </td>

              <td style={{ padding: '12px' }}>
                {ticket.analysis?.category ? (
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'white',
                      backgroundColor:
                        categoryColors[ticket.analysis.category] || '#7f8c8d',
                    }}
                  >
                    {ticket.analysis.category}
                  </span>
                ) : (
                  '—'
                )}
              </td>

              <td style={{ padding: '12px', fontSize: '13px' }}>
                {ticket.analysis?.detected_language || '—'}
              </td>

              <td style={{ padding: '12px' }}>
                {addedIds.has(ticket.ticket_id) ? (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#27ae60',
                      fontWeight: 600,
                    }}
                  >
                    ✓ Added
                  </span>
                ) : (
                  <span style={{ fontSize: '12px', color: '#ccc' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* selected ticket detail */}
      {selected?.analysis && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3
            style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '0.5rem',
            }}
          >
            {selected.ticket_id} — {selected.title}
          </h3>
          <AnalysisResult analysis={selected.analysis} />
        </div>
      )}

    </div>
  );
}

export default TicketList;