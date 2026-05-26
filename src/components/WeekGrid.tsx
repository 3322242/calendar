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
import { CurrentTimeLine } from './CurrentTime';
import { DraggableEvent } from './DraggableEvent';
import { Event } from './Event';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_MINUTES = 30;
const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;

export function WeekGrid() {
  const { events, date, locale, weekStartsOn, maxEventsPerDay, maxOverlap, labels, onSlotClick } =
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
      map.set(day.toISOString(), layoutTimedEvents(dayEvents, day, { maxOverlap }));
    }
    return map;
  }, [events, days, maxOverlap]);

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
      <div className="cal-week-day-headers" data-cal-week-day-headers>
        <div className="cal-week-corner" data-cal-week-corner />
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="cal-week-day-header"
              data-cal-week-day-header
              data-today={today || undefined}
            >
              <span className="cal-week-day-name" data-cal-day-name>
                {new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(day)}
              </span>
              <span className="cal-week-day-num" data-cal-day-num>
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {maxAllDayRows > 0 && (
        <AllDayHeader
          days={days}
          positioned={allDayPositioned}
          overflow={allDayOverflow}
          maxRows={maxAllDayRows}
          locale={locale}
          allDayLabel={labels.allDay}
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
            const layout = timedByDay.get(dayKey) ?? { positioned: [], overflowBySlot: new Map() };
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

                {layout.positioned.map((pos) => (
                  <DraggableEvent
                    key={String(pos.event.id)}
                    event={pos.event}
                    positioned={pos}
                    className="cal-week-event"
                  />
                ))}

                <CurrentTimeLine day={day} />

                {Array.from(layout.overflowBySlot.entries()).map(([hour, info]) => (
                  <div
                    key={`overflow-${hour}`}
                    className="cal-week-overflow"
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
  allDayLabel,
}: {
  days: Date[];
  positioned: ReturnType<typeof layoutAllDayEvents>['positioned'];
  overflow: Map<number, number>;
  maxRows: number;
  locale: string;
  allDayLabel: string;
}) {
  return (
    <div className="cal-week-allday" data-cal-allday>
      <div className="cal-week-allday-label" data-cal-allday-label>
        {allDayLabel}
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
