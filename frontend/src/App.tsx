import React, { useState } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import BulkAnalyze from './components/bulkAnalyze';
import { useTheme } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import KnowledgeBase from './components/knowledgeBase';


type Screen = 'analyze' | 'list' | 'bulk' | 'knowledge';

function App() {
  const [screen, setScreen] = useState<Screen>('analyze');
  const { theme, toggleTheme } = useTheme();
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    border: 'none',
    borderBottom: active
      ? `2px solid ${theme === 'light' ? '#2c3e50' : '#f0f0f0'}`
      : '2px solid transparent',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: active ? 600 : 400,
    color: active ? (theme === 'light' ? '#2c3e50' : '#f0f0f0') : '#999',
    cursor: 'pointer',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme === 'light' ? 'white' : '#1a1a1a',
        color: theme === 'light' ? 'black' : 'white',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '2rem 1rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        }}
      >
        {/* header row — title left, button right */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px' }}>
              Support Ticket Analyzer
            </h1>
            <p
              style={{
                margin: 0,
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '14px',
              }}
            >
              Multilingual AI-powered analysis — English, French, Arabic, German
            </p>
          </div>

          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 16px',
              border: `1px solid ${theme === 'light' ? '#e0e0e0' : '#444'}`,
              borderRadius: '6px',
              backgroundColor: theme === 'light' ? '#2c3e50' : '#f0f0f0',
              color: theme === 'light' ? 'white' : '#2c3e50',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
          </button>
        </div>

        {/* tabs */}
        <div
          style={{
            borderBottom: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
            marginBottom: '1.5rem',
          }}
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
          <button
  style={tabStyle(screen === 'knowledge')}
  onClick={() => setScreen('knowledge')}
>
  Knowledge Base
</button>

        </div>

        {screen === 'analyze' && (
  <ErrorBoundary>
    <TicketForm />
  </ErrorBoundary>
)}
{screen === 'list' && (
  <ErrorBoundary>
    <TicketList />
  </ErrorBoundary>
)}
{screen === 'bulk' && (
  <ErrorBoundary>
    <BulkAnalyze />
  </ErrorBoundary>
)}
{screen === 'knowledge' && (
  <ErrorBoundary>
    <KnowledgeBase />
  </ErrorBoundary>
)}
      </div>
    </div>
  );
}

export default App;
