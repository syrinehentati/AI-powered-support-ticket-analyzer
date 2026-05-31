import React, { useState } from 'react';
import styles from './AnalysisResult.module.css';
import { TicketAnalysis } from '../../types';
import { addToKnowledgeBase } from '../../services/api';

interface Props {
  analysis: TicketAnalysis;
  ticketData?: {
    ticket_id: string;
    title: string;
    description: string;
    logs: string[];
  };
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

function AnalysisResult({ analysis, ticketData }: Props) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleAddToKnowledgeBase() {
    if (!ticketData) return;
    setAdding(true);
    setAddError(null);

    try {
      await addToKnowledgeBase({
        ticket_id: ticketData.ticket_id,
        title: ticketData.title,
        description: ticketData.description,
        logs: ticketData.logs,
        resolution: analysis.resolution,
        category: analysis.category,
        severity: analysis.severity,
        detected_language: analysis.detected_language,
      });
      setAdded(true);
    } catch (err) {
      setAddError('Failed to add to knowledge base.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* badges */}
      <div className={styles.badges}>
        <span
          className={styles.badge}
          style={{
            backgroundColor: severityColors[analysis.severity] || '#7f8c8d',
          }}
        >
          {analysis.severity.toUpperCase()}
        </span>
        <span
          className={styles.badge}
          style={{
            backgroundColor: categoryColors[analysis.category] || '#7f8c8d',
          }}
        >
          {analysis.category.toUpperCase()}
        </span>
        <span className={styles.badge} style={{ backgroundColor: '#34495e' }}>
          {analysis.detected_language}
        </span>
      </div>

      {/* summary */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Summary</h3>
        <p className={styles.text}>{analysis.summary}</p>
      </div>

      {/* root cause */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Root Cause</h3>
        <p className={styles.text}>{analysis.root_cause}</p>
      </div>

      {/* resolution steps */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Resolution Steps</h3>
        <ol className={styles.list}>
          {analysis.resolution.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      {/* similar tickets */}
      {analysis.similar_tickets && analysis.similar_tickets.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            Informed by similar past incidents
          </h3>
          {analysis.similar_tickets.map((ticket) => (
            <div
              key={ticket.ticket_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span
                style={{ fontSize: '12px', color: '#666', minWidth: '80px' }}
              >
                {ticket.ticket_id}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {ticket.title}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '140px',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${ticket.similarity}%`,
                      height: '100%',
                      backgroundColor:
                        ticket.similarity >= 80
                          ? '#27ae60'
                          : ticket.similarity >= 60
                            ? '#f39c12'
                            : '#e67e22',
                      borderRadius: '3px',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#666',
                    minWidth: '36px',
                  }}
                >
                  {ticket.similarity}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* add to knowledge base */}
      {ticketData && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          {added ? (
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#27ae60',
                fontWeight: 600,
              }}
            >
              ✓ Added to knowledge base. Future analyses will learn from this
              incident.
            </p>
          ) : (
            <button
              onClick={handleAddToKnowledgeBase}
              disabled={adding}
              style={{
                padding: '8px 16px',
                backgroundColor: adding ? '#bbb' : '#2c3e50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: adding ? 'not-allowed' : 'pointer',
              }}
            >
              {adding ? 'Adding...' : '+ Add to Knowledge Base'}
            </button>
          )}
          {addError && (
            <p
              style={{ margin: '8px 0 0', fontSize: '13px', color: '#c0392b' }}
            >
              {addError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AnalysisResult;
