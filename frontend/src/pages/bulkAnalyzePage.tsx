import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  analyzeTicket,
  addToKnowledgeBase,
  getKnowledgeBase,
} from '../services/api';
import { Ticket } from '../types';
import AnalysisResult from '../components/analyze/AnalysisResult';

function BulkAnalyzePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [existingKBIds, setExistingKBIds] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);

  const isMounted = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── effects ─────────────────────────────────────────────────

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    getKnowledgeBase()
      .then((entries) =>
        setExistingKBIds(new Set(entries.map((e) => e.ticket_id)))
      )
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

  // whether ALL loaded tickets already have analysis
  const allAnalyzed = tickets.length > 0 && tickets.every((t) => t.analysis);
  // whether tickets were uploaded from file (i.e. not from bulk analyze)
  const hasUnanalyzed = tickets.some((t) => !t.analysis);

  // ─── file handling ────────────────────────────────────────────

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    setSelected(null);
    setCheckedIds(new Set());
    setAnalyzeProgress(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'json') {
        const text = await file.text();
        const data = JSON.parse(text);
        if (isMounted.current) setTickets(data);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        const normalized = json.map((row: any) => ({
          ticket_id: row.ticket_id,
          title: row.title,
          description: row.description,
          severity: row.severity,
          logs:
            typeof row.logs === 'string' ? row.logs.split('|') : row.logs || [],
        }));
        if (isMounted.current) setTickets(normalized as Ticket[]);
      } else {
        setError('Unsupported file type. Please upload a .json or .xlsx file.');
      }
    } catch {
      if (isMounted.current)
        setError('Invalid file format. Could not parse the uploaded file.');
    } finally {
      if (isMounted.current) setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  // ─── analyze uploaded tickets ─────────────────────────────────

  async function handleAnalyzeUploaded() {
    const toAnalyze = tickets.filter((t) => !t.analysis);
    if (toAnalyze.length === 0) return;

    setAnalyzing(true);
    setError(null);
    setAnalyzeProgress({ done: 0, total: toAnalyze.length });

    for (let i = 0; i < toAnalyze.length; i++) {
      const ticket = toAnalyze[i];
      try {
        const analyzed = await analyzeTicket({
          ticket_id: ticket.ticket_id,
          title: ticket.title,
          description: ticket.description,
          logs: ticket.logs,
          severity: ticket.severity,
        });

        if (!isMounted.current) break;

        // merge analysis result back into the ticket list
        setTickets((prev) =>
          prev.map((t) =>
            t.ticket_id === ticket.ticket_id
              ? { ...t, analysis: analyzed.analysis }
              : t
          )
        );
      } catch {
        // skip failed tickets silently, keep going
      }

      if (isMounted.current) {
        setAnalyzeProgress({ done: i + 1, total: toAnalyze.length });
      }
    }

    if (isMounted.current) {
      setAnalyzing(false);
      setAnalyzeProgress(null);
    }
  }

  // ─── selection ───────────────────────────────────────────────

  function toggleCheck(ticketId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(ticketId) ? next.delete(ticketId) : next.add(ticketId);
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

  // ─── knowledge base ──────────────────────────────────────────

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
        setExistingKBIds((prev) => new Set(prev).add(ticket.ticket_id));
      } catch {
        // skip failed ones silently
      }
    }
    setCheckedIds(new Set());
    setAdding(false);
  }

  // ─── severity colors ─────────────────────────────────────────

  const severityColor: Record<string, string> = {
    low: '#27ae60',
    medium: '#f39c12',
    high: '#e67e22',
    critical: '#e74c3c',
  };

  // ─── render ───────────────────────────────────────────────────

  return (
    <div>
      {/* ── Upload Canvas ──────────────────────────────────────── */}
      <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '14px' }}>
        Analyzes all mock tickets at once — English, French, Arabic and German.
      </p>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          marginBottom: '1.5rem',
          border: `2px dashed ${isDragOver ? '#2c3e50' : '#c8d0d8'}`,
          borderRadius: '10px',
          padding: '28px 24px',
          textAlign: 'center',
          backgroundColor: isDragOver ? '#f0f4f8' : '#fafbfc',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background-color 0.2s',
          position: 'relative',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.xlsx,.xls"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />

        <div style={{ fontSize: '28px', marginBottom: '8px', lineHeight: 1 }}>
          {uploading ? '⏳' : isDragOver ? '📂' : '📁'}
        </div>

        {uploading ? (
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Loading file…
          </p>
        ) : (
          <>
            <p
              style={{
                margin: '0 0 4px',
                fontWeight: 600,
                fontSize: '14px',
                color: '#2c3e50',
              }}
            >
              {isDragOver ? 'Drop to upload' : 'Drag & drop your file here'}
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#888' }}>
              or click to browse — supports <strong>.json</strong> and{' '}
              <strong>.xlsx / .xls</strong>
            </p>
            {tickets.length > 0 && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 12px',
                  backgroundColor: '#e8f5e9',
                  color: '#27ae60',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                ✓ {tickets.length} tickets loaded
              </span>
            )}
          </>
        )}
      </div>

      {/* ── Analyze uploaded tickets CTA ─────────────────────────── */}
      {hasUnanalyzed && !analyzing && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '14px 16px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <span
              style={{ fontSize: '14px', fontWeight: 600, color: '#92400e' }}
            >
              {tickets.filter((t) => !t.analysis).length} ticket
              {tickets.filter((t) => !t.analysis).length !== 1 ? 's' : ''} not
              yet analyzed
            </span>
            <span
              style={{ fontSize: '13px', color: '#b45309', marginLeft: '8px' }}
            >
              — run analysis to see results
            </span>
          </div>
          <button
            onClick={handleAnalyzeUploaded}
            style={{
              padding: '8px 18px',
              backgroundColor: '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Analyze tickets
          </button>
        </div>
      )}

      {/* ── Analysis progress bar ─────────────────────────────────── */}
      {analyzing && analyzeProgress && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
            Analyzing ticket {analyzeProgress.done + 1} of{' '}
            {analyzeProgress.total}…
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
                width: `${(analyzeProgress.done / analyzeProgress.total) * 100}%`,
                backgroundColor: '#2c3e50',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {analyzeProgress.done} / {analyzeProgress.total} done
          </p>
        </div>
      )}

      

      {/* ── Error ───────────────────────────────────────────────── */}
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

      {/* ── Results ─────────────────────────────────────────────── */}
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
            ✓ {tickets.length} tickets
            {allAnalyzed ? ' analyzed successfully' : ' loaded'}
          </p>

          {/* severity summary — only when there's analysis data */}
          {summary && allAnalyzed && (
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
                    backgroundColor: severityColor[severity] || '#7f8c8d',
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
                  ? 'Adding…'
                  : `+ Add ${newToAddCount > 0 ? newToAddCount : ''} to Knowledge Base`}
              </button>
            </div>
          </div>

          {/* ── split layout: table + side panel ───────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: selected?.analysis ? '1fr 380px' : '1fr',
              gap: '1rem',
              alignItems: 'start',
              transition: 'grid-template-columns 0.25s ease',
            }}
          >
            {/* table */}
            <div style={{ overflow: 'auto' }}>
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
                          tickets.length > 0 &&
                          checkedIds.size === tickets.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    {[
                      'ID',
                      'Title',
                      'Language',
                      'Category',
                      'Severity',
                      'KB',
                    ].map((col) => (
                      <th
                        key={col}
                        style={{
                          textAlign: 'left',
                          padding: '10px 12px',
                          color: '#666',
                          fontWeight: 600,
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => {
                    const isSelected = selected?.ticket_id === ticket.ticket_id;
                    const isAnalyzing = analyzing && !ticket.analysis;
                    return (
                      <tr
                        key={ticket.ticket_id}
                        onClick={() =>
                          ticket.analysis
                            ? setSelected(isSelected ? null : ticket)
                            : undefined
                        }
                        style={{
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: isSelected
                            ? '#eef2f7'
                            : isAnalyzing
                              ? '#fafafa'
                              : 'transparent',
                          cursor: ticket.analysis ? 'pointer' : 'default',
                          transition: 'background-color 0.15s',
                          opacity: isAnalyzing ? 0.5 : 1,
                        }}
                      >
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
                        <td
                          style={{
                            padding: '12px',
                            fontSize: '12px',
                            color: '#666',
                          }}
                        >
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
                          {ticket.analysis && !isSelected && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: '11px',
                                color: '#aaa',
                              }}
                            >
                              › view
                            </span>
                          )}
                          {isAnalyzing && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: '11px',
                                color: '#b45309',
                              }}
                            >
                              analyzing…
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {ticket.analysis?.detected_language || '—'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {ticket.analysis?.category || '—'}
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
                                severityColor[
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
                            <span style={{ fontSize: '12px', color: '#ccc' }}>
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── side panel ───────────────────────────────────── */}
            {selected?.analysis && (
              <div
                style={{
                  position: 'sticky',
                  top: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  animation: 'slideIn 0.2s ease',
                }}
              >
                <style>{`
                  @keyframes slideIn {
                    from { opacity: 0; transform: translateX(16px); }
                    to   { opacity: 1; transform: translateX(0); }
                  }
                `}</style>

                {/* panel header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#999',
                        marginBottom: '2px',
                      }}
                    >
                      {selected.ticket_id}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#2c3e50',
                        maxWidth: '280px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {selected.title}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      color: '#999',
                      lineHeight: 1,
                      padding: '2px 4px',
                    }}
                    title="Close"
                  >
                    ×
                  </button>
                </div>

                {/* panel body */}
                <div
                  style={{
                    padding: '16px',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                  }}
                >
                  <AnalysisResult analysis={selected.analysis} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkAnalyzePage;
