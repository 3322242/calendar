import { useEffect, useState } from 'react';
import { Calendar } from '../src';
import '../src/theme/index.css';
import type { CalendarEvent, RangeChangeInfo, SlotClickInfo } from '../src';

type Theme = 'light' | 'dark';

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cal-demo-theme') as Theme | null;
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-cal-theme', theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('cal-demo-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return [theme, toggle];
}

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team standup',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'Design review',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
    color: '#8b5cf6',
  },
  {
    id: '3',
    title: 'Lunch with client',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
    color: '#f59e0b',
  },
  {
    id: '4',
    title: 'Sprint planning',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
    color: '#10b981',
  },
  {
    id: '5',
    title: 'Overlapping meeting',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
    color: '#ef4444',
  },
  {
    id: '6',
    title: 'Conference (all day)',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    allDay: true,
    color: '#06b6d4',
  },
  {
    id: '7',
    title: 'Project deadline',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 17, 0),
    color: '#ef4444',
  },
  {
    id: '8',
    title: 'Workshop',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
    color: '#8b5cf6',
  },
  {
    id: '9',
    title: 'Multi-day retreat',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
    allDay: true,
    color: '#10b981',
  },
  {
    id: '10',
    title: 'Morning yoga',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 7, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 8, 0),
    color: '#f472b6',
  },
];

export function App() {
  const [theme, toggleTheme] = useTheme();
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev].slice(0, 10));
  };

  const handleEventClick = (event: CalendarEvent) => {
    addLog(`Event clicked: "${event.title}"`);
  };

  const handleSlotClick = (info: SlotClickInfo) => {
    const time = info.allDay
      ? 'all day'
      : `${info.start.toLocaleTimeString()} – ${info.end.toLocaleTimeString()}`;
    addLog(`Slot clicked: ${time}`);
  };

  const handleRangeChange = (info: RangeChangeInfo) => {
    addLog(`Range: ${info.start.toLocaleDateString()} – ${info.end.toLocaleDateString()} (${info.view})`);
  };

  const isDark = theme === 'dark';

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: isDark ? '#111827' : '#ffffff',
      color: isDark ? '#f9fafb' : '#111827',
      minHeight: '100vh',
      transition: 'background 150ms ease, color 150ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>@vspro/calendar demo</h1>
          <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '14px', margin: 0 }}>
            {SAMPLE_EVENTS.length} events loaded. Click events or empty slots to see callbacks.
          </p>
        </div>
        <button
          onClick={toggleTheme}
          style={{
            padding: '8px 16px',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '6px',
            background: isDark ? '#1f2937' : '#f9fafb',
            color: isDark ? '#f9fafb' : '#111827',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {isDark ? '☀ Light' : '● Dark'}
        </button>
      </div>

      <div style={{
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        <Calendar
          events={SAMPLE_EVENTS}
          defaultView="month"
          weekStartsOn={1}
          maxEventsPerDay={3}
          onEventClick={handleEventClick}
          onSlotClick={handleSlotClick}
          onRangeChange={handleRangeChange}
        />
      </div>

      {log.length > 0 && (
        <div style={{
          padding: '12px',
          background: isDark ? '#1f2937' : '#f9fafb',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}>
          <strong>Event log:</strong>
          {log.map((msg, i) => (
            <div key={i} style={{ color: isDark ? '#d1d5db' : '#374151', padding: '2px 0' }}>{msg}</div>
          ))}
        </div>
      )}
    </div>
  );
}
