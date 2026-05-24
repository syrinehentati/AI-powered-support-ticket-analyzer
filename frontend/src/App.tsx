import React, { useState } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import BulkAnalyze from './components/bulkAnalyze';
import { useTheme } from './context/ThemeContext';

type Screen = 'analyze' | 'list' | 'bulk';

function App() {
  const [screen, setScreen] = useState<Screen>('analyze');
  const { theme, toggleTheme } = useTheme();
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
        backgroundColor: theme === 'light' ? 'white' : '#1a1a1a',
        color: theme === 'light' ? 'black' : 'white',

        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      }}
    >
      <button
        onClick={toggleTheme}
        style={{
          padding: '8px 16px',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          backgroundColor: theme === 'light' ? '#2c3e50' : '#f0f0f0',
          color: theme === 'light' ? 'white' : '#2c3e50',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
      </button>

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
