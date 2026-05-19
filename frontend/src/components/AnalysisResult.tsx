import React from 'react';
import { TicketAnalysis } from '../types';
import styles from './AnalysisResult.module.css';

interface Props {
  analysis: TicketAnalysis;
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

function AnalysisResult({ analysis }: Props) {
  return (
    <div className={styles.container}>
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

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Summary</h3>
        <p className={styles.text}>{analysis.summary}</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Root Cause</h3>
        <p className={styles.text}>{analysis.root_cause}</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Resolution Steps</h3>
        <ol className={styles.list}>
          {analysis.resolution.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default AnalysisResult;
