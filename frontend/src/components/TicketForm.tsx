import React, { useEffect, useRef, useState } from 'react';
import AnalysisResult from './AnalysisResult';
import { useTicketAnalysis } from './useTicketAnalysis';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 600,
  fontSize: '14px',
  color: '#333',
};

function TicketForm() {
  const [formData, setFormData] = useState({
    ticket_id: '',
    title: '',
    description: '',
    severity: 'medium',
    logs: '',
  });

  
  const ticketIdRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { result, loading, error, analyze } = useTicketAnalysis();


  useEffect(() => {
    ticketIdRef.current?.focus();
  }, []);

  useEffect(() => {
  if (result) {
    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
}, [result]);

  function handleSubmit() {
    analyze({
      ...formData,
      logs: formData.logs
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0),
    });
  }

  return (
    <div>
      {/* ticket id and severity row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Ticket ID</label>
          <input
            style={inputStyle}
             ref={ticketIdRef} 
            placeholder="TKT-001"
            value={formData.ticket_id}
            onChange={(e) =>
              setFormData({ ...formData, ticket_id: e.target.value })
            }
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Severity</label>
          <select
            style={inputStyle}
            value={formData.severity}
            onChange={(e) =>
              setFormData({ ...formData, severity: e.target.value })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* title */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Title</label>
        <input
          style={inputStyle}
          placeholder="Brief description of the issue"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />
      </div>

      {/* description */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
          placeholder="Detailed description of the problem..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      {/* logs */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>
          Logs
          <span style={{ fontWeight: 400, color: '#999', marginLeft: '8px' }}>
            one log line per line
          </span>
        </label>
        <textarea
          style={{
            ...inputStyle,
            height: '120px',
            resize: 'vertical',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
          placeholder={`2026-05-14 07:32:11 ERROR AuthService - JWT validation failed\n2026-05-14 07:32:12 WARN RateLimiter - 14 failed attempts`}
          value={formData.logs}
          onChange={(e) =>
            setFormData({ ...formData, logs: e.target.value })
          }
        />
      </div>

      {/* submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#bbb' : '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze Ticket'}
      </button>

      {/* error */}
      {error && (
        <div
          style={{
            marginTop: '1rem',
            padding: '12px',
            backgroundColor: '#fdecea',
            border: '1px solid #f5c6cb',
            borderRadius: '6px',
            color: '#c0392b',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* result */}
      {result?.analysis && (
        <div ref={resultRef}>
      <AnalysisResult analysis={result.analysis} />
      </div>) }
    </div>
  );
}

export default TicketForm;