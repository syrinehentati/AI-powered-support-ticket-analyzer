import React, { useState } from 'react';
import { addToKnowledgeBase } from '../services/api';
import { useTickets } from '../hooks/useTickets';
import { Ticket } from '../types';
import Skeleton from '../components/ui/Skeleton';
import ErrorCard from '../components/ui/ErrorCard';
import TicketTable from '../components/incidents/TicketTable';
import TicketDetailPanel from '../components/incidents/TicketDetailPanel';

function IncidentsPage() {
  const { data: tickets = [], isLoading, error, refetch } = useTickets();

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

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

  function handleSelect(ticket: Ticket) {
    setSelected(selected?.ticket_id === ticket.ticket_id ? null : ticket);
  }

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

  // ─── early returns ───────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Skeleton height={42} />
        <Skeleton height={42} />
        <Skeleton height={42} />
      </div>
    );
  }

  if (error) {
    return <ErrorCard message="Failed to load incidents." onRetry={refetch} />;
  }

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

  // ─── render ──────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* search bar */}
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

      {/* action bar */}
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

      {/* table */}
      <TicketTable
        tickets={filteredTickets}
        selectedId={selected?.ticket_id ?? null}
        checkedIds={checkedIds}
        addedIds={addedIds}
        onSelect={handleSelect}
        onCheck={toggleCheck}
      />

      {/* detail panel */}
      {selected?.analysis && (
        <TicketDetailPanel
          ticket={selected}
          onClose={() => setSelected(null)}
        />
      )}

    </div>
  );
}

export default IncidentsPage;