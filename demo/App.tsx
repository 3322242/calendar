import { useCallback, useEffect, useRef, useState } from 'react';
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

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#f472b6', '#ec4899'];

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Team standup', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30), color: '#3b82f6' },
  { id: '2', title: 'Design review', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30), color: '#8b5cf6' },
  { id: '3', title: 'Lunch with client', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0), color: '#f59e0b' },
  { id: '4', title: 'Sprint planning', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30), color: '#10b981' },
  { id: '5', title: 'Overlapping meeting', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), color: '#ef4444' },
  { id: '6', title: 'Conference (all day)', start: today, end: today, allDay: true, color: '#06b6d4' },
  { id: '7', title: 'Project deadline', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 17, 0), color: '#ef4444' },
  { id: '8', title: 'Workshop', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0), color: '#8b5cf6' },
  { id: '9', title: 'Multi-day retreat', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), allDay: true, color: '#10b981' },
  { id: '10', title: 'Morning yoga', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 7, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 8, 0), color: '#f472b6' },
];

let nextId = 100;

function toLocalISOString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

interface CreateDialogProps {
  info: SlotClickInfo;
  isDark: boolean;
  onSave: (event: CalendarEvent) => void;
  onClose: () => void;
}

function CreateDialog({ info, isDark, onSave, onClose }: CreateDialogProps) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState(toLocalISOString(info.start));
  const [end, setEnd] = useState(toLocalISOString(info.end));
  const [color, setColor] = useState(COLORS[Math.floor(Math.random() * COLORS.length)]!);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: String(nextId++),
      title: title.trim(),
      start: new Date(start),
      end: new Date(end),
      allDay: info.allDay,
      color,
    });
  };

  const bg = isDark ? '#1f2937' : '#ffffff';
  const border = isDark ? '#374151' : '#e5e7eb';
  const inputBg = isDark ? '#111827' : '#f9fafb';

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '24px', width: '380px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Нова подія</h3>

        <label style={{ display: 'block', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280', display: 'block', marginBottom: '4px' }}>Назва</span>
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Зустріч, дзвінок, задача..."
            style={{ width: '100%', padding: '8px 10px', border: `1px solid ${border}`, borderRadius: '6px', background: inputBg, color: 'inherit', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </label>

        {!info.allDay && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <label style={{ flex: 1 }}>
              <span style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280', display: 'block', marginBottom: '4px' }}>Початок</span>
              <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${border}`, borderRadius: '6px', background: inputBg, color: 'inherit', fontSize: '13px', boxSizing: 'border-box' }} />
            </label>
            <label style={{ flex: 1 }}>
              <span style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280', display: 'block', marginBottom: '4px' }}>Кінець</span>
              <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${border}`, borderRadius: '6px', background: inputBg, color: 'inherit', fontSize: '13px', boxSizing: 'border-box' }} />
            </label>
          </div>
        )}

        <label style={{ display: 'block', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280', display: 'block', marginBottom: '4px' }}>Колір</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: color === c ? '2px solid white' : '2px solid transparent', boxShadow: color === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer' }}
              />
            ))}
          </div>
        </label>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', border: `1px solid ${border}`, borderRadius: '6px', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: '13px' }}>
            Скасувати
          </button>
          <button type="submit" disabled={!title.trim()} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: '#fff', cursor: title.trim() ? 'pointer' : 'not-allowed', opacity: title.trim() ? 1 : 0.5, fontSize: '13px' }}>
            Створити
          </button>
        </div>
      </form>
    </div>
  );
}

export function App() {
  const [theme, toggleTheme] = useTheme();
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [createInfo, setCreateInfo] = useState<SlotClickInfo | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev].slice(0, 10));
  };

  const handleEventClick = (event: CalendarEvent) => {
    addLog(`Подія: "${event.title}"`);
  };

  const handleSlotClick = (info: SlotClickInfo) => {
    setCreateInfo(info);
  };

  const handleRangeChange = (info: RangeChangeInfo) => {
    addLog(`Діапазон: ${info.start.toLocaleDateString('uk')} – ${info.end.toLocaleDateString('uk')} (${info.view})`);
  };

  const handleEventDrop = useCallback((event: CalendarEvent, newStart: Date, newEnd: Date) => {
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, start: newStart, end: newEnd } : e)));
    addLog(`Переміщено: "${event.title}" → ${newStart.toLocaleTimeString('uk')}`);
  }, []);

  const handleEventResize = useCallback((event: CalendarEvent, newStart: Date, newEnd: Date) => {
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, start: newStart, end: newEnd } : e)));
    addLog(`Змінено тривалість: "${event.title}" → ${newEnd.toLocaleTimeString('uk')}`);
  }, []);

  const handleCreate = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
    setCreateInfo(null);
    addLog(`Створено: "${event.title}"`);
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
            {events.length} подій. Клікни на порожній слот щоб створити. Перетягуй події у тижневому/денному виді.
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
          events={events}
          defaultView="month"
          locale="uk"
          weekStartsOn={1}
          maxEventsPerDay={3}
          onEventClick={handleEventClick}
          onSlotClick={handleSlotClick}
          onRangeChange={handleRangeChange}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
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
          <strong>Журнал подій:</strong>
          {log.map((msg, i) => (
            <div key={i} style={{ color: isDark ? '#d1d5db' : '#374151', padding: '2px 0' }}>{msg}</div>
          ))}
        </div>
      )}

      {createInfo && (
        <CreateDialog
          info={createInfo}
          isDark={isDark}
          onSave={handleCreate}
          onClose={() => setCreateInfo(null)}
        />
      )}
    </div>
  );
}
