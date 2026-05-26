import { useCalendarContext } from '../core/store';
import type { CalendarEvent } from '../core/types';

export interface EventProps {
  event: CalendarEvent;
  style?: React.CSSProperties;
  className?: string;
}

export function Event({ event, style, className }: EventProps) {
  const { onEventClick } = useCalendarContext();

  const colorStyle = event.color
    ? ({ '--cal-event-color': event.color } as React.CSSProperties)
    : undefined;

  return (
    <button
      className={`cal-event ${className ?? ''}`}
      data-cal-event
      data-cal-event-id={String(event.id)}
      data-all-day={event.allDay || undefined}
      style={{ ...colorStyle, ...style }}
      onClick={() => onEventClick?.(event)}
      type="button"
      aria-label={event.title}
    >
      <span className="cal-event-title" data-cal-event-title>
        {event.title}
      </span>
    </button>
  );
}
