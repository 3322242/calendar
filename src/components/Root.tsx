import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addDays,
  addMonths,
  dayRange,
  getWeekStartFromLocale,
  monthGridRange,
  weekRange,
} from '../core/date-utils';
import type { CalendarLabels } from '../core/i18n';
import { resolveLabels } from '../core/i18n';
import { CalendarContext, type CalendarContextValue } from '../core/store';
import type {
  CalendarEvent,
  CalendarProps,
  RangeChangeInfo,
  ViewType,
} from '../core/types';

export interface RootProps extends CalendarProps {
  children: React.ReactNode;
}

export function Root({
  children,
  events = [],
  view: controlledView,
  defaultView = 'month',
  date: controlledDate,
  defaultDate,
  locale = 'default',
  timezone,
  weekStartsOn: weekStartsOnProp,
  maxEventsPerDay = 3,
  maxOverlap = 4,
  labels: customLabels,
  onEventClick,
  onSlotClick,
  onRangeChange,
  onViewChange,
  onDateChange,
  onEventDrop,
  onEventResize,
}: RootProps) {
  const isViewControlled = controlledView !== undefined;
  const isDateControlled = controlledDate !== undefined;

  const weekStartsOn = weekStartsOnProp ?? getWeekStartFromLocale(locale);
  const labels = useMemo(() => resolveLabels(locale, customLabels), [locale, customLabels]);

  const [internalView, setInternalView] = useState<ViewType>(defaultView);
  const [internalDate, setInternalDate] = useState<Date>(() => defaultDate ?? new Date());

  const view = isViewControlled ? controlledView : internalView;
  const date = isDateControlled ? controlledDate : internalDate;

  const setView = useCallback(
    (newView: ViewType) => {
      if (!isViewControlled) setInternalView(newView);
      onViewChange?.(newView);
    },
    [isViewControlled, onViewChange],
  );

  const setDate = useCallback(
    (newDate: Date) => {
      if (!isDateControlled) setInternalDate(newDate);
      onDateChange?.(newDate);
    },
    [isDateControlled, onDateChange],
  );

  const navigate = useCallback(
    (direction: -1 | 0 | 1) => {
      if (direction === 0) {
        setDate(new Date());
        return;
      }
      const current = date;
      let next: Date;
      switch (view) {
        case 'month':
          next = addMonths(current, direction);
          break;
        case 'week':
          next = addDays(current, direction * 7);
          break;
        case 'day':
          next = addDays(current, direction);
          break;
      }
      setDate(next);
    },
    [date, view, setDate],
  );

  const prevRangeRef = useRef<string>('');

  useEffect(() => {
    if (!onRangeChange) return;

    let range: { start: Date; end: Date };
    switch (view) {
      case 'month':
        range = monthGridRange(date, weekStartsOn);
        break;
      case 'week':
        range = weekRange(date, weekStartsOn);
        break;
      case 'day':
        range = dayRange(date);
        break;
    }

    const key = `${range.start.getTime()}-${range.end.getTime()}-${view}`;
    if (key === prevRangeRef.current) return;
    prevRangeRef.current = key;

    onRangeChange({ start: range.start, end: range.end, view });
  }, [date, view, weekStartsOn, onRangeChange]);

  const contextValue = useMemo<CalendarContextValue>(
    () => ({
      events,
      date,
      view,
      locale,
      timezone,
      weekStartsOn,
      maxEventsPerDay,
      maxOverlap,
      labels,
      navigate,
      setView,
      setDate,
      onEventClick,
      onSlotClick,
      onRangeChange,
      onEventDrop,
      onEventResize,
    }),
    [
      events,
      date,
      view,
      locale,
      timezone,
      weekStartsOn,
      maxEventsPerDay,
      maxOverlap,
      labels,
      navigate,
      setView,
      setDate,
      onEventClick,
      onSlotClick,
      onRangeChange,
      onEventDrop,
      onEventResize,
    ],
  );

  return <CalendarContext.Provider value={contextValue}>{children}</CalendarContext.Provider>;
}
