import { useMemo } from 'react';
import {
  addMinutes,
  dayRange,
  formatTime,
  isSameDay,
  isToday,
} from '../core/date-utils';
import { layoutAllDayEvents, layoutTimedEvents } from '../core/event-layout';
import { useCalendarContext } from '../core/store';
import { Event } from './Event';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_MINUTES = 30;
const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;

export function DayGrid() {
  const { events, date, locale, maxEventsPerDay, maxOverlap, onSlotClick } = useCalendarContext();

  const { start } = useMemo(() => dayRange(date), [date]);

  const layout = useMemo(() => {
    const dayEvents = events.filter((e) => !e.allDay && isSameDay(e.start, date));
    return layoutTimedEvents(dayEvents, date, { maxOverlap });
  }, [events, date, maxOverlap]);

  const { allDayPositioned, maxRows } = useMemo(() => {
    const { positioned: p } = layoutAllDayEvents(events, start, 1, maxEventsPerDay);
    const rows = p.length > 0 ? Math.max(...p.map((x) => x.row + 1)) : 0;
    return { allDayPositioned: p, maxRows: rows };
  }, [events, start, maxEventsPerDay]);

  const today = isToday(date);

  const handleSlotClick = (hour: number, minute: number) => {
    if (!onSlotClick) return;
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);
    const slotEnd = addMinutes(slotStart, SLOT_MINUTES);
    onSlotClick({ start: slotStart, end: slotEnd, allDay: false });
  };

  return (
    <div className="cal-day" data-cal-day-view role="grid" aria-label="Day view">
      {maxRows > 0 && (
        <div className="cal-day-allday" data-cal-allday>
          <div className="cal-day-allday-label" data-cal-allday-label>
            All day
          </div>
          <div className="cal-day-allday-events" data-cal-allday-events>
            {allDayPositioned.map((pos) => (
              <Event key={String(pos.event.id)} event={pos.event} />
            ))}
          </div>
        </div>
      )}

      <div className="cal-day-body" data-cal-day-body>
        <div className="cal-day-time-axis" data-cal-time-axis>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="cal-day-time-label"
              data-cal-time-label
              aria-hidden="true"
            >
              {formatTime(new Date(2026, 0, 1, hour, 0), locale)}
            </div>
          ))}
        </div>

        <div
          className="cal-day-column"
          data-cal-day-col
          data-today={today || undefined}
        >
          {HOURS.map((hour) =>
            Array.from({ length: SLOTS_PER_HOUR }, (_, slotIdx) => {
              const minute = slotIdx * SLOT_MINUTES;
              return (
                <div
                  key={`${hour}-${minute}`}
                  className="cal-day-slot"
                  data-cal-slot
                  data-hour={hour}
                  data-minute={minute}
                  onClick={() => handleSlotClick(hour, minute)}
                  role="button"
                  tabIndex={0}
                  aria-label={formatTime(new Date(2026, 0, 1, hour, minute), locale)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSlotClick(hour, minute);
                    }
                  }}
                />
              );
            }),
          )}

          {layout.positioned.map((pos) => (
            <Event
              key={String(pos.event.id)}
              event={pos.event}
              className="cal-day-event"
              style={{
                position: 'absolute',
                top: `${pos.top * 100}%`,
                height: `${pos.height * 100}%`,
                left: `${pos.left * 100}%`,
                width: `${pos.width * 100}%`,
              }}
            />
          ))}

          {Array.from(layout.overflowBySlot.entries()).map(([hour, info]) => (
            <div
              key={`overflow-${hour}`}
              className="cal-day-overflow"
              data-cal-overflow
              style={{
                position: 'absolute',
                top: `${(hour / 24) * 100}%`,
                right: '2px',
                zIndex: 3,
              }}
            >
              +{info.count}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
