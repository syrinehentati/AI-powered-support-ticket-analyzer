import React, { useState } from 'react';
import { addToKnowledgeBase } from '../services/api';
import { useTickets } from '../hooks/useTickets';

import { Ticket } from '../types';

import Skeleton from './ui/Skeleton';
import ErrorCard from './ui/ErrorCard';
import AnalysisResult from './AnalysisResult';

function TicketList() {
  const { data: tickets = [], isLoading, error, refetch } = useTickets();

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  // 🔍 SEARCH (NEW)
  const [search, setSearch] = useState('');

  // ─────────────────────────────────────────────
  // FILTER LOGIC (NEW ONLY)
  // ─────────────────────────────────────────────
  const filteredTickets = tickets.filter((t: Ticket) => {
    const q = search.toLowerCase();

    return (
      t.ticket_id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.analysis?.category?.toLowerCase().includes(q) ||
      t.analysis?.severity?.toLowerCase().includes(q) ||
      t.analysis?.detected_language?.toLowerCase().includes(q)
    );
  });

  // ─────────────────────────────────────────────
  // Selection logic (UNCHANGED)
  // ─────────────────────────────────────────────
  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (checkedIds.size === filteredTickets.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(filteredTickets.map((t: Ticket) => t.ticket_id)));
    }
  }

  // ─────────────────────────────────────────────
  // Add to KB (UNCHANGED)
  // ─────────────────────────────────────────────
  async function handleAddToKB() {
    const toAdd = filteredTickets.filter(
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

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Skeleton height={42} />
        <Skeleton height={42} />
        <Skeleton height={42} />
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ERROR
  // ─────────────────────────────────────────────
  if (error) {
    return (
      <ErrorCard
        message="Failed to load incidents."
        onRetry={refetch}
      />
    );
  }

  // ─────────────────────────────────────────────
  // EMPTY
  // ─────────────────────────────────────────────
  if (!tickets.length) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          color: '#64748b',
          border: '1px dashed #cbd5e1',
          borderRadius: 16,
        }}
      >
        No incidents available
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // UI (UNCHANGED + SEARCH ADDED)
  // ─────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* 🔍 SEARCH BAR (minimal, same style) */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search incidents..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #e0e0e0',
            fontSize: 13,
          }}
        />

        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e0e0e0',
              backgroundColor: 'white',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ACTION BAR (UNCHANGED) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 12,
          borderRadius: 12,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ fontSize: 13, color: '#64748b' }}>
          {checkedIds.size} selected
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleSelectAll}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {checkedIds.size === filteredTickets.length
              ? 'Deselect all'
              : 'Select all'}
          </button>

          <button
            onClick={handleAddToKB}
            disabled={adding}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              background: '#0f172a',
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

      {/* TABLE (ONLY CHANGE = filteredTickets) */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ textAlign: 'left', color: '#64748b' }}>
              <th></th>
              <th>ID</th>
              <th>Title</th>
              <th>Severity</th>
              <th>Category</th>
              <th>Language</th>
              <th>KB</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.map((t: Ticket) => (
              <tr
                key={t.ticket_id}
                onClick={() =>
                  setSelected(
                    selected?.ticket_id === t.ticket_id ? null : t
                  )
                }
                style={{
                  borderTop: '1px solid #e2e8f0',
                  background:
                    selected?.ticket_id === t.ticket_id
                      ? '#f1f5f9'
                      : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checkedIds.has(t.ticket_id)}
                    onChange={() => toggleCheck(t.ticket_id)}
                  />
                </td>

                <td style={{ fontSize: 12, color: '#64748b' }}>
                  {t.ticket_id}
                </td>

                <td style={{ fontWeight: 500 }}>{t.title}</td>

                <td>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      color: 'white',
                      background:
                        t.analysis?.severity === 'critical'
                          ? '#ef4444'
                          : t.analysis?.severity === 'high'
                          ? '#f97316'
                          : t.analysis?.severity === 'medium'
                          ? '#f59e0b'
                          : '#22c55e',
                    }}
                  >
                    {(t.analysis?.severity || t.severity).toUpperCase()}
                  </span>
                </td>

                <td style={{ fontSize: 13 }}>
                  {t.analysis?.category || '—'}
                </td>

                <td style={{ fontSize: 13 }}>
                  {t.analysis?.detected_language || '—'}
                </td>

                <td>
                  {addedIds.has(t.ticket_id) ? (
                    <span style={{ color: '#22c55e', fontSize: 12 }}>
                      ✓ Added
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAIL */}
      {selected?.analysis && (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            background: 'white',
          }}
        >
          <h3 style={{ marginBottom: 8 }}>
            {selected.ticket_id} — {selected.title}
          </h3>

          <AnalysisResult analysis={selected.analysis} />
        </div>
      )}
    </div>
  );
}

export default TicketList;