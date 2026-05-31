import React, { useEffect, useState, useCallback } from 'react';
import { getKnowledgeBase } from '../services/api';

interface KnowledgeBaseEntry {
  id: string;
  ticket_id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  detected_language: string;
  resolution: string[];
  created_at: string;
}

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

function KnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<KnowledgeBaseEntry | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getKnowledgeBase();
      setEntries(data);
    } catch (err) {
      setError(
        'Could not load knowledge base. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  if (loading)
    return (
      <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
        Loading knowledge base...
      </p>
    );

  if (error)
    return (
      <p style={{ color: '#c0392b', textAlign: 'center', padding: '2rem' }}>
        {error}
      </p>
    );

  return (
    <div>
      {/* header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {entries.length === 0
              ? 'No entries yet. Analyze tickets and add them to build your knowledge base.'
              : `${entries.length} resolved incident${entries.length === 1 ? '' : 's'} stored. AI uses these to inform future analyses.`}
          </p>
        </div>
        <button
          onClick={fetchEntries}
          style={{
            padding: '8px 16px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      {/* empty state */}
      {entries.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            border: '2px dashed #e0e0e0',
            borderRadius: '8px',
            color: '#999',
          }}
        >
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            Knowledge base is empty
          </p>
          <p style={{ fontSize: '13px', margin: 0 }}>
            Analyze a ticket then click "Add to Knowledge Base" to start
            building it.
          </p>
        </div>
      )}

      {/* entries table */}
      {entries.length > 0 && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
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
                Added
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                onClick={() =>
                  setSelected(selected?.id === entry.id ? null : entry)
                }
                style={{
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  backgroundColor:
                    selected?.id === entry.id ? '#f8f9fa' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  (
                    e.currentTarget as HTMLTableRowElement
                  ).style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  (
                    e.currentTarget as HTMLTableRowElement
                  ).style.backgroundColor =
                    selected?.id === entry.id ? '#f8f9fa' : 'transparent';
                }}
              >
                <td
                  style={{ padding: '12px', fontSize: '12px', color: '#666' }}
                >
                  {entry.ticket_id}
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
                  {entry.title}
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
                        categoryColors[entry.category] || '#7f8c8d',
                    }}
                  >
                    {entry.category}
                  </span>
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
                        severityColors[entry.severity] || '#7f8c8d',
                    }}
                  >
                    {entry.severity}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '13px' }}>
                  {entry.detected_language}
                </td>
                <td
                  style={{ padding: '12px', fontSize: '12px', color: '#999' }}
                >
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* selected entry detail */}
      {selected && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px' }}>
              {selected.ticket_id} — {selected.title}
            </h3>
            <button
              onClick={() => setSelected(null)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#999',
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4
              style={{
                margin: '0 0 8px',
                fontSize: '13px',
                color: '#666',
                textTransform: 'uppercase',
              }}
            >
              Description
            </h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>
              {selected.description}
            </p>
          </div>

          <div>
            <h4
              style={{
                margin: '0 0 8px',
                fontSize: '13px',
                color: '#666',
                textTransform: 'uppercase',
              }}
            >
              Resolution that worked
            </h4>
            <ol
              style={{
                margin: 0,
                paddingLeft: '1.2rem',
                lineHeight: 2,
                fontSize: '14px',
              }}
            >
              {selected.resolution.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeBase;
