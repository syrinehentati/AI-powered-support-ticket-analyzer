import {
  LayoutDashboard,
  Search,
  Database,
  FolderOpen,
  Brain,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type Screen = 'dashboard' | 'analyze' | 'list' | 'knowledge' | 'bulk';

interface Props {
  current: Screen;
  onChange: (screen: Screen) => void;
}

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'analyze', label: 'Analyze', icon: Brain },
  { key: 'list', label: 'Incidents', icon: Search },
  { key: 'knowledge', label: 'Knowledge', icon: Database },
  { key: 'bulk', label: 'Bulk Ops', icon: FolderOpen },
] as const;

export default function Sidebar({ current, onChange }: Props) {
  const { theme } = useTheme();
  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid #e5e7eb',
        padding: 24,
        background: theme === 'dark' ? '#111827' : '#ffffff',
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
          Incident AI
        </h2>
        <p style={{ marginTop: 4, fontSize: 13, color: '#64748b' }}>
          Intelligence Platform
        </p>
      </div>

      {/* NAV ITEMS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = current === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key as Screen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                background: active ? '#0f172a' : 'transparent',
                color: active ? 'white' : '#334155',
                fontWeight: 500,
                transition: '0.2s ease',
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
