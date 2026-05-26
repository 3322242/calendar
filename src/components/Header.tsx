import { useMemo } from 'react';
import {
  dayRange,
  formatDayDate,
  formatMonthYear,
  formatWeekRange,
  weekRange,
} from '../core/date-utils';
import { useCalendarContext } from '../core/store';
import type { ViewType } from '../core/types';

export function Header({ children }: { children?: React.ReactNode }) {
  return (
    <div className="cal-header" data-cal-header role="toolbar" aria-label="Calendar navigation">
      {children}
    </div>
  );
}

export function NavPrev() {
  const { navigate } = useCalendarContext();
  return (
    <button
      className="cal-nav-prev"
      data-cal-nav="prev"
      onClick={() => navigate(-1)}
      aria-label="Previous"
      type="button"
    >
      ‹
    </button>
  );
}

export function NavNext() {
  const { navigate } = useCalendarContext();
  return (
    <button
      className="cal-nav-next"
      data-cal-nav="next"
      onClick={() => navigate(1)}
      aria-label="Next"
      type="button"
    >
      ›
    </button>
  );
}

export function NavToday() {
  const { navigate, labels } = useCalendarContext();
  return (
    <button
      className="cal-nav-today"
      data-cal-nav="today"
      onClick={() => navigate(0)}
      type="button"
    >
      {labels.today}
    </button>
  );
}

export function Title() {
  const { date, view, locale, weekStartsOn } = useCalendarContext();

  const title = useMemo(() => {
    switch (view) {
      case 'month':
        return formatMonthYear(date, locale);
      case 'week': {
        const { start, end } = weekRange(date, weekStartsOn);
        return formatWeekRange(start, end, locale);
      }
      case 'day':
        return formatDayDate(date, locale);
    }
  }, [date, view, locale, weekStartsOn]);

  return (
    <h2 className="cal-title" data-cal-title aria-live="polite">
      {title}
    </h2>
  );
}

export function ViewSwitcher() {
  const { view, setView, labels } = useCalendarContext();
  const views: { key: ViewType; label: string }[] = [
    { key: 'month', label: labels.month },
    { key: 'week', label: labels.week },
    { key: 'day', label: labels.day },
  ];

  return (
    <div className="cal-view-switcher" data-cal-view-switcher role="tablist">
      {views.map((v) => (
        <button
          key={v.key}
          className="cal-view-btn"
          data-cal-view={v.key}
          data-active={view === v.key || undefined}
          onClick={() => setView(v.key)}
          role="tab"
          aria-selected={view === v.key}
          type="button"
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
