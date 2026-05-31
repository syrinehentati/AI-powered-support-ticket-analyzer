import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Ticket | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [existingKBIds, setExistingKBIds] = useState<Set<string>>(new Set());

  const isMounted = useRef(true);

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

  // ─────────────────────────────
  // FILE PARSER (JSON / XLSX)
  // ─────────────────────────────
  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'json') {
        const text = await file.text();
        const data = JSON.parse(text);
        setTickets(data);
      }

      if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(sheet);

        // normalize logs if needed
        const normalized = json.map((row: any) => ({
          ticket_id: row.ticket_id,
          title: row.title,
          description: row.description,
          severity: row.severity,
          logs:
            typeof row.logs === 'string' ? row.logs.split('|') : row.logs || [],
        }));

        setTickets(normalized as Ticket[]);
      }
    } catch (e) {
      setError('Invalid file format');
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  // ─────────────────────────────
  // ANALYSIS
  // ─────────────────────────────
  async function handleBulkAnalyze() {
    setLoading(true);
    setError(null);
    setCheckedIds(new Set());

    try {
      const results = await bulkAnalyze();
      setTickets(results);
    } catch {
      setError('Bulk analyze failed');
    } finally {
      setLoading(false);
    }
  }

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
      setCheckedIds(new Set(tickets.map((t) => t.ticket_id)));
    }
  }

  async function handleAddToKB() {
    const toAdd = tickets.filter(
      (t) => checkedIds.has(t.ticket_id) && !existingKBIds.has(t.ticket_id)
    );

    setAdding(true);

    for (const t of toAdd) {
      if (!t.analysis) continue;

      await addToKnowledgeBase({
        ticket_id: t.ticket_id,
        title: t.title,
        description: t.description,
        logs: t.logs,
        resolution: t.analysis.resolution,
        category: t.analysis.category,
        severity: t.analysis.severity,
        detected_language: t.analysis.detected_language,
      });

      setExistingKBIds((p) => new Set(p).add(t.ticket_id));
    }

    setAdding(false);
    setCheckedIds(new Set());
  }

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* UPLOAD ZONE */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed #cbd5e1',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center',
          background: '#f8fafc',
        }}
      >
        <p style={{ margin: 0, fontSize: 14 }}>
          Drag & drop JSON or Excel file here
        </p>

        <input
          type="file"
          accept=".json,.xlsx,.xls"
          onChange={onFileSelect}
          style={{ marginTop: 10 }}
        />

        {uploading && <p>Loading file...</p>}
      </div>

      {/* ACTION BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 12,
          border: '1px solid #e2e8f0',
          borderRadius: 12,
        }}
      >
        <div>{checkedIds.size} selected</div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleSelectAll}>Select all</button>
          <button onClick={handleAddToKB}>Add to KB</button>
        </div>
      </div>

      {/* TABLE */}
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Title</th>
            <th>Severity</th>
            <th>Category</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((t) => (
            <tr
              key={t.ticket_id}
              onClick={() =>
                setSelected(selected?.ticket_id === t.ticket_id ? null : t)
              }
              style={{ cursor: 'pointer' }}
            >
              <td onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={checkedIds.has(t.ticket_id)}
                  onChange={() => toggleCheck(t.ticket_id)}
                />
              </td>

              <td>{t.ticket_id}</td>
              <td>{t.title}</td>
              <td>{t.severity}</td>
              <td>{t.analysis?.category || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DETAIL */}
      {selected?.analysis && <AnalysisResult analysis={selected.analysis} />}
    </div>
  );
}

export default BulkAnalyze;
