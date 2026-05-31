import React, { useState } from 'react';
import { addToKnowledgeBase } from '../services/api';
import { useTickets } from '../hooks/useTickets';

import { Ticket } from '../types';
import Skeleton from './ui/Skeleton';
import ErrorCard from './ui/ErrorCard';
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
  const { data: tickets = [], isLoading, error, refetch } = useTickets();

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  // ───────────────────────── selection ─────────────────────────
  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (checkedIds.size === tickets.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(tickets.map((t: Ticket) => t.ticket_id)));
    }
  }

  // ───────────────────────── add KB ─────────────────────────
  async function handleAddToKB() {
    const toAdd = tickets.filter(
      (t: Ticket) =>
        checkedIds.has(t.ticket_id) && !addedIds.has(t.ticket_id)
    );

    if (!toAdd.length) return;

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

        setAddedIds((prev) => new Set(prev).add(ticket.ticket_id));
      } catch {
        // silent fail
      }
    }

    setCheckedIds(new Set());
    setAdding(false);
  }

  // ───────────────────────── LOADING ─────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
      </div>
    );
  }

  // ───────────────────────── ERROR ─────────────────────────
  if (error) {
    return (
      <ErrorCard
        message="Could not load incidents. Backend may be offline."
        onRetry={refetch}
      />
    );
  }

  // ───────────────────────── EMPTY ─────────────────────────
  if (!tickets.length) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem',
          border: '2px dashed #e0e0e0',
          borderRadius: '8px',
          color: '#999',
        }}
      >
        No tickets available
      </div>
    );
  }

  // ───────────────────────── UI ─────────────────────────
  return (
    <div>

      {/* header (same style as KB) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          {tickets.length} incidents available
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleSelectAll}
            style={{
              padding: '8px 14px',
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {checkedIds.size === tickets.length
              ? 'Deselect all'
              : 'Select all'}
          </button>

          <button
            onClick={handleAddToKB}
            disabled={adding}
            style={{
              padding: '8px 14px',
              border: 'none',
              borderRadius: 6,
              background: '#2c3e50',
              color: 'white',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              opacity: adding ? 0.6 : 1,
            }}
          >
            {adding ? 'Adding...' : 'Add to Knowledge Base'}
          </button>
        </div>
      </div>

      {/* TABLE (same style as KB) */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ width: 40 }}></th>
            <th style={{ textAlign: 'left', padding: '10px 12px' }}>ID</th>
            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Title</th>
            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Category</th>
            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Severity</th>
            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Language</th>
            <th style={{ textAlign: 'left', padding: '10px 12px' }}>KB</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((t: Ticket) => (
            <tr
              key={t.ticket_id}
              onClick={() =>
                setSelected(
                  selected?.ticket_id === t.ticket_id ? null : t
                )
              }
              style={{
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                backgroundColor:
                  selected?.ticket_id === t.ticket_id
                    ? '#f8f9fa'
                    : 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                  '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                  selected?.ticket_id === t.ticket_id
                    ? '#f8f9fa'
                    : 'transparent';
              }}
            >
              {/* checkbox */}
              <td
                style={{ padding: '12px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={checkedIds.has(t.ticket_id)}
                  onChange={() => toggleCheck(t.ticket_id)}
                />
              </td>

              {/* ID */}
              <td style={{ fontSize: 12, color: '#666' }}>
                {t.ticket_id}
              </td>

              {/* Title */}
              <td
                style={{
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.title}
              </td>

              {/* Category */}
              <td>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor:
                      categoryColors[t.analysis?.category || 'other'],
                  }}
                >
                  {t.analysis?.category || '—'}
                </span>
              </td>

              {/* Severity */}
              <td>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor:
                      severityColors[
                        t.analysis?.severity || t.severity
                      ],
                  }}
                >
                  {(t.analysis?.severity || t.severity).toUpperCase()}
                </span>
              </td>

              {/* Language */}
              <td style={{ fontSize: 13 }}>
                {t.analysis?.detected_language || '—'}
              </td>

              {/* KB */}
              <td>
                {addedIds.has(t.ticket_id) ? (
                  <span style={{ color: '#27ae60', fontSize: 12 }}>
                    ✓ Added
                  </span>
                ) : (
                  <span style={{ color: '#999' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DETAIL PANEL (same KB style) */}
      {selected?.analysis && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            backgroundColor: '#fafafa',
          }}
        >
          <h3 style={{ margin: 0 }}>
            {selected.ticket_id} — {selected.title}
          </h3>

          <AnalysisResult analysis={selected.analysis} />
        </div>
      )}
    </div>
  );
}

export default TicketList;