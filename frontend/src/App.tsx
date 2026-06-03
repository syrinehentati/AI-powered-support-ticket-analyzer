import React, { useState } from 'react';

import TicketForm from './pages/AnalyzePage';
import TicketList from './pages/IncidentsPage';
import BulkAnalyze from './pages/bulkAnalyzePage';
import KnowledgeBase from './pages/knowledgeBasePage';
import Dashboard from './pages/DashboardPage';

import { useTheme } from './context/ThemeContext';
import Sidebar from './layouts/Sidebar';
import NetworkErrorBanner from './components/Networkerrorbanner';

type Screen = 'dashboard' | 'analyze' | 'list' | 'knowledge' | 'bulk';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [screen, setScreen] = useState<Screen>('dashboard');

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: theme === 'light' ? '#f8fafc' : '#0f172a',
        color: theme === 'light' ? '#0f172a' : '#f8fafc',
      }}
    >
      <NetworkErrorBanner />
      {/* SIDEBAR */}
      <Sidebar current={screen} onChange={setScreen} />

      {/* MAIN CONTENT AREA */}
      <div
        style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>
              IncidentIQ
            </h1>
            <p style={{ marginTop: 6, opacity: 0.7 }}>
              AI Incident Intelligence Platform
            </p>
          </div>

          <button
            onClick={toggleTheme}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: theme === 'light' ? '#0f172a' : '#f8fafc',
              color: theme === 'light' ? '#f8fafc' : '#0f172a',
            }}
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        {/* PAGE CONTENT */}
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'analyze' && <TicketForm />}
        {screen === 'list' && <TicketList />}
        {screen === 'knowledge' && <KnowledgeBase />}
        {screen === 'bulk' && <BulkAnalyze />}
      </div>
    </div>
  );
}

export default App;
