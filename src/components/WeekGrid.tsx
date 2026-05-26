import { useMemo } from 'react';
import {
  addMinutes,
  eachDayOfRange,
  formatTime,
  isSameDay,
  isToday,
  startOfDay,
  weekRange,
} from '../core/date-utils';
import { layoutAllDayEvents, layoutTimedEvents } from '../core/event-layout';
import { useCalendarContext } from '../core/store';
import type { CalendarEvent } from '../core/types';
import { Event } from './Event';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_MINUTES = 30;
const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;

export function WeekGrid() {
  const { events, date, locale, weekStartsOn, maxEventsPerDay, onSlotClick } =
    useCalendarContext();

  const { days, range } = useMemo(() => {
    const r = weekRange(date, weekStartsOn);
    return { days: eachDayOfRange(r.start, r.end), range: r };
  }, [date, weekStartsOn]);

  const timedByDay = useMemo(() => {
    const map = new Map<string, ReturnType<typeof layoutTimedEvents>>();
    for (const day of days) {
      const dayEvents = events.filter(
        (e) => !e.allDay && isSameDay(e.start, day),
      );
      map.set(day.toISOString(), layoutTimedEvents(dayEvents, day));
    }
    return map;
  }, [events, days]);

  const { allDayPositioned, allDayOverflow } = useMemo(() => {
    const { positioned, overflowCounts } = layoutAllDayEvents(
      events,
      range.start,
      7,
      maxEventsPerDay,
    );
    return { allDayPositioned: positioned, allDayOverflow: overflowCounts };
  }, [events, range.start, maxEventsPerDay]);

  const maxAllDayRows = useMemo(() => {
    if (allDayPositioned.length === 0) return 0;
    return Math.max(...allDayPositioned.map((p) => p.row + 1));
  }, [allDayPositioned]);

  const handleSlotClick = (day: Date, hour: number, minute: number) => {
    if (!onSlotClick) return;
    const start = new Date(day);
    start.setHours(hour, minute, 0, 0);
    const end = addMinutes(start, SLOT_MINUTES);
    onSlotClick({ start, end, allDay: false });
  };

  return (
    <div className="cal-week" data-cal-week role="grid" aria-label="Week view">
      {maxAllDayRows > 0 && (
        <AllDayHeader
          days={days}
          positioned={allDayPositioned}
          overflow={allDayOverflow}
          maxRows={maxAllDayRows}
          locale={locale}
        />
      )}

      <div className="cal-week-body" data-cal-week-body>
        <div className="cal-week-time-axis" data-cal-time-axis>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="cal-week-time-label"
              data-cal-time-label
              aria-hidden="true"
            >
              {formatTime(new Date(2026, 0, 1, hour, 0), locale)}
            </div>
          ))}
        </div>

        <div className="cal-week-columns" data-cal-week-columns>
          {days.map((day) => {
            const dayKey = day.toISOString();
            const positioned = timedByDay.get(dayKey) ?? [];
            const today = isToday(day);

            return (
              <div
                key={dayKey}
                className="cal-week-day-col"
                data-cal-day-col
                data-today={today || undefined}
                role="gridcell"
              >
                {HOURS.map((hour) =>
                  Array.from({ length: SLOTS_PER_HOUR }, (_, slotIdx) => {
                    const minute = slotIdx * SLOT_MINUTES;
                    return (
                      <div
                        key={`${hour}-${minute}`}
                        className="cal-week-slot"
                        data-cal-slot
                        data-hour={hour}
                        data-minute={minute}
                        onClick={() => handleSlotClick(day, hour, minute)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${formatTime(new Date(2026, 0, 1, hour, minute), locale)}, ${new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' }).format(day)}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSlotClick(day, hour, minute);
                          }
                        }}
                      />
                    );
                  }),
                )}

                {positioned.map((pos) => (
                  <Event
                    key={String(pos.event.id)}
                    event={pos.event}
                    className="cal-week-event"
                    style={{
                      position: 'absolute',
                      top: `${pos.top * 100}%`,
                      height: `${pos.height * 100}%`,
                      left: `${pos.left * 100}%`,
                      width: `${pos.width * 100}%`,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AllDayHeader({
  days,
  positioned,
  overflow,
  maxRows,
  locale,
}: {
  days: Date[];
  positioned: ReturnType<typeof layoutAllDayEvents>['positioned'];
  overflow: Map<number, number>;
  maxRows: number;
  locale: string;
}) {
  return (
    <div className="cal-week-allday" data-cal-allday>
      <div className="cal-week-allday-label" data-cal-allday-label>
        All day
      </div>
      <div
        className="cal-week-allday-grid"
        data-cal-allday-grid
        style={{ gridTemplateRows: `repeat(${maxRows}, 24px)` }}
      >
        {days.map((day, dayIdx) => {
          const dayOverflow = overflow.get(dayIdx) ?? 0;
          return (
            <div
              key={day.toISOString()}
              className="cal-week-allday-col"
              data-cal-allday-col
              data-today={isToday(day) || undefined}
              style={{ gridColumn: dayIdx + 1 }}
            >
              {dayOverflow > 0 && (
                <span className="cal-week-allday-more" data-cal-allday-more>
                  +{dayOverflow}
                </span>
              )}
            </div>
          );
        })}

        {positioned.map((pos) => (
          <Event
            key={String(pos.event.id)}
            event={pos.event}
            className="cal-week-allday-event"
            style={{
              gridColumn: `${pos.startDay + 1} / span ${pos.spanDays}`,
              gridRow: pos.row + 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
