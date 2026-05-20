import React, { useState } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import BulkAnalyze from './components/bulkAnalyze';

type Screen = 'analyze' | 'list' | 'bulk';

function App() {
  const [screen, setScreen] = useState<Screen>('analyze');

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    border: 'none',
    borderBottom: active ? '2px solid #2c3e50' : '2px solid transparent',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: active ? 600 : 400,
    color: active ? '#2c3e50' : '#999',
    cursor: 'pointer',
  });

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '24px', color: '#2c3e50' }}>
          Support Ticket Analyzer
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Multilingual AI-powered analysis — English, French, Arabic, German
        </p>
      </div>

      <div
        style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '1.5rem' }}
      >
        <button
          style={tabStyle(screen === 'analyze')}
          onClick={() => setScreen('analyze')}
        >
          Analyze Ticket
        </button>
        <button
          style={tabStyle(screen === 'list')}
          onClick={() => setScreen('list')}
        >
          All Tickets
        </button>
        <button
          style={tabStyle(screen === 'bulk')}
          onClick={() => setScreen('bulk')}
        >
          Bulk Analyze
        </button>
      </div>

      {screen === 'analyze' && <TicketForm />}
      {screen === 'list' && <TicketList />}
      {screen === 'bulk' && <BulkAnalyze />}
    </div>
  );
}

export default App;
