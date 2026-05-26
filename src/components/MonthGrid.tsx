import { useMemo } from 'react';
import { addDays, eachDayOfRange, isSameMonth, isToday, monthGridRange } from '../core/date-utils';
import { getEventsForDay } from '../core/event-layout';
import { useCalendarContext } from '../core/store';
import type { CalendarEvent } from '../core/types';
import { Event } from './Event';

export function MonthGrid() {
  const { events, date, locale, weekStartsOn, maxEventsPerDay, labels, onSlotClick } =
    useCalendarContext();

  const { gridDays, weekDayNames } = useMemo(() => {
    const { start, end } = monthGridRange(date, weekStartsOn);
    const days = eachDayOfRange(start, end);
    const names: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      names.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d));
    }
    return { gridDays: days, weekDayNames: names };
  }, [date, weekStartsOn, locale]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const day of gridDays) {
      const key = day.toISOString();
      map.set(key, getEventsForDay(events, day));
    }
    return map;
  }, [events, gridDays]);

  const handleSlotClick = (day: Date) => {
    if (!onSlotClick) return;
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    onSlotClick({ start, end, allDay: true });
  };

  return (
    <div className="cal-month" data-cal-month role="grid" aria-label="Month view">
      <div className="cal-month-header" data-cal-month-header role="row">
        {weekDayNames.map((name, i) => (
          <div
            key={i}
            className="cal-month-weekday"
            data-cal-weekday
            role="columnheader"
            aria-label={name}
          >
            {name}
          </div>
        ))}
      </div>
      <div className="cal-month-body" data-cal-month-body>
        {gridDays.map((day) => {
          const dayEvents = eventsByDay.get(day.toISOString()) ?? [];
          const visibleEvents = dayEvents.slice(0, maxEventsPerDay);
          const overflowCount = dayEvents.length - visibleEvents.length;
          const inMonth = isSameMonth(day, date);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className="cal-month-cell"
              data-cal-day
              data-today={today || undefined}
              data-other-month={!inMonth || undefined}
              role="gridcell"
              aria-label={new Intl.DateTimeFormat(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(day)}
              onClick={() => handleSlotClick(day)}
            >
              <span className="cal-month-day-number" data-cal-day-number>
                {day.getDate()}
              </span>
              <div className="cal-month-events" data-cal-day-events>
                {visibleEvents.map((event) => (
                  <Event key={String(event.id)} event={event} />
                ))}
                {overflowCount > 0 && (
                  <button
                    className="cal-month-more"
                    data-cal-more
                    type="button"
                    aria-label={`${overflowCount} more events`}
                  >
                    {labels.more(overflowCount)}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
