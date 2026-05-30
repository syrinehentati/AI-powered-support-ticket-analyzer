import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  bulkAnalyze,
  addToKnowledgeBase,
  getKnowledgeBase,
} from '../services/api';
import { Ticket } from '../types';
import AnalysisResult from './AnalysisResult';

function BulkAnalyze() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [existingKBIds, setExistingKBIds] = useState<Set<string>>(new Set());

  const isMounted = useRef(true);

  // ─── effects ─────────────────────────────────────────────────

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    getKnowledgeBase()
      .then((entries) => {
        setExistingKBIds(new Set(entries.map((e) => e.ticket_id)));
      })
      .catch(() => {});
  }, []);

  // ─── derived values ───────────────────────────────────────────

  const summary = useMemo(() => {
    if (tickets.length === 0) return null;

    const bySeverity = tickets.reduce(
      (acc, t) => {
        const sev = t.analysis?.severity || 'unknown';
        acc[sev] = (acc[sev] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { bySeverity };
  }, [tickets]);

  const selectedCount = checkedIds.size;
  const alreadyAddedCount = [...checkedIds].filter((id) =>
    existingKBIds.has(id)
  ).length;
  const newToAddCount = selectedCount - alreadyAddedCount;

  // ─── handlers ─────────────────────────────────────────────────

  async function handleBulkAnalyze() {
    setLoading(true);
    setError(null);
    setTickets([]);
    setSelected(null);
    setCheckedIds(new Set());

    try {
      const results = await bulkAnalyze();
      if (isMounted.current) setTickets(results);
    } catch (err: any) {
      if (isMounted.current)
        setError('Bulk analyze failed. Make sure the backend is running.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }

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
      (t) => checkedIds.has(t.ticket_id) && !existingKBIds.has(t.ticket_id)
    );

    if (toAdd.length === 0) return;

    setAdding(true);

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
        // update real source of truth immediately
        setExistingKBIds((prev) => new Set(prev).add(ticket.ticket_id));
      } catch (err) {
        // skip failed ones silently
      }
    }

    setCheckedIds(new Set());
    setAdding(false);
  }

  // ─── render ───────────────────────────────────────────────────

  return (
    <div>
      {/* header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '14px' }}>
          Analyzes all mock tickets at once — English, French, Arabic and
          German.
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
            Processing tickets. This takes about 30 seconds...
          </p>
          <div
            style={{
              height: '6px',
              backgroundColor: '#e0e0e0',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '100%',
                backgroundColor: '#2c3e50',
                borderRadius: '3px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
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
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fdecea',
            border: '1px solid #f5c6cb',
            borderRadius: '6px',
            color: '#c0392b',
            fontSize: '14px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* results */}
      {tickets.length > 0 && (
        <div>
          <p
            style={{
              fontSize: '14px',
              color: '#27ae60',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            ✓ {tickets.length} tickets analyzed successfully
          </p>

          {/* severity summary */}
          {summary && (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              {Object.entries(summary.bySeverity).map(([severity, count]) => (
                <div
                  key={severity}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor:
                      (
                        {
                          low: '#27ae60',
                          medium: '#f39c12',
                          high: '#e67e22',
                          critical: '#e74c3c',
                        } as Record<string, string>
                      )[severity] || '#7f8c8d',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {severity}: {count}
                </div>
              ))}
            </div>
          )}

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
                      : ' — all already in knowledge base'
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
                {checkedIds.size === tickets.length
                  ? 'Deselect all'
                  : 'Select all'}
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
                  KB
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.ticket_id}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor:
                      selected?.ticket_id === ticket.ticket_id
                        ? '#f8f9fa'
                        : 'transparent',
                  }}
                >
                  {/* checkbox */}
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

                  {/* id */}
                  <td
                    style={{
                      padding: '12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#666',
                    }}
                    onClick={() =>
                      setSelected(
                        selected?.ticket_id === ticket.ticket_id ? null : ticket
                      )
                    }
                  >
                    {ticket.ticket_id}
                  </td>

                  {/* title */}
                  <td
                    style={{
                      padding: '12px',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      setSelected(
                        selected?.ticket_id === ticket.ticket_id ? null : ticket
                      )
                    }
                  >
                    {ticket.title}
                  </td>

                  {/* language */}
                  <td style={{ padding: '12px' }}>
                    {ticket.analysis?.detected_language || '—'}
                  </td>

                  {/* category */}
                  <td style={{ padding: '12px' }}>
                    {ticket.analysis?.category || '—'}
                  </td>

                  {/* severity */}
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'white',
                        backgroundColor:
                          (
                            {
                              low: '#27ae60',
                              medium: '#f39c12',
                              high: '#e67e22',
                              critical: '#e74c3c',
                            } as Record<string, string>
                          )[ticket.analysis?.severity || ticket.severity] ||
                          '#7f8c8d',
                      }}
                    >
                      {(
                        ticket.analysis?.severity || ticket.severity
                      ).toUpperCase()}
                    </span>
                  </td>

                  {/* kb status */}
                  <td style={{ padding: '12px' }}>
                    {existingKBIds.has(ticket.ticket_id) ? (
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
      )}
    </div>
  );
}

export default BulkAnalyze;
