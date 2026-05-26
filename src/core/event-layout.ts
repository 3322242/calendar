import { diffInMinutes, isSameDay, startOfDay } from './date-utils';
import type { AllDayPositionedEvent, CalendarEvent, PositionedEvent } from './types';

export function layoutTimedEvents(
  events: CalendarEvent[],
  dayStart: Date,
): PositionedEvent[] {
  const timed = events.filter((e) => !e.allDay);
  if (timed.length === 0) return [];

  const sorted = [...timed].sort((a, b) => {
    const diff = a.start.getTime() - b.start.getTime();
    if (diff !== 0) return diff;
    return b.end.getTime() - a.end.getTime();
  });

  const dayStartTime = startOfDay(dayStart);
  const clusters = buildClusters(sorted);
  const result: PositionedEvent[] = [];

  for (const cluster of clusters) {
    const columns: CalendarEvent[][] = [];

    for (const event of cluster) {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const lastInCol = columns[col]![columns[col]!.length - 1]!;
        if (event.start.getTime() >= lastInCol.end.getTime()) {
          columns[col]!.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([event]);
      }
    }

    const totalColumns = columns.length;

    for (let col = 0; col < columns.length; col++) {
      for (const event of columns[col]!) {
        const topMinutes = Math.max(0, diffInMinutes(dayStartTime, event.start));
        const durationMinutes = Math.max(15, diffInMinutes(event.start, event.end));

        result.push({
          event,
          top: topMinutes / 1440,
          height: durationMinutes / 1440,
          left: col / totalColumns,
          width: 1 / totalColumns,
          column: col,
          totalColumns,
        });
      }
    }
  }

  return result;
}

function buildClusters(sorted: CalendarEvent[]): CalendarEvent[][] {
  if (sorted.length === 0) return [];

  const clusters: CalendarEvent[][] = [];
  let current: CalendarEvent[] = [sorted[0]!];
  let clusterEnd = sorted[0]!.end.getTime();

  for (let i = 1; i < sorted.length; i++) {
    const event = sorted[i]!;
    if (event.start.getTime() < clusterEnd) {
      current.push(event);
      clusterEnd = Math.max(clusterEnd, event.end.getTime());
    } else {
      clusters.push(current);
      current = [event];
      clusterEnd = event.end.getTime();
    }
  }
  clusters.push(current);

  return clusters;
}

export function layoutAllDayEvents(
  events: CalendarEvent[],
  gridStart: Date,
  gridDays: number,
  maxPerDay?: number,
): { positioned: AllDayPositionedEvent[]; overflowCounts: Map<number, number> } {
  const allDay = events.filter((e) => e.allDay);
  if (allDay.length === 0) return { positioned: [], overflowCounts: new Map() };

  const sorted = [...allDay].sort((a, b) => {
    const diff = a.start.getTime() - b.start.getTime();
    if (diff !== 0) return diff;
    return b.end.getTime() - a.end.getTime();
  });

  const rows: { event: CalendarEvent; startDay: number; endDay: number }[] = [];

  for (const event of sorted) {
    const eventStartDay = Math.max(
      0,
      Math.floor((startOfDay(event.start).getTime() - startOfDay(gridStart).getTime()) / 86_400_000),
    );
    const eventEndDay = Math.min(
      gridDays - 1,
      Math.floor((startOfDay(event.end).getTime() - startOfDay(gridStart).getTime()) / 86_400_000),
    );
    if (eventStartDay > gridDays - 1 || eventEndDay < 0) continue;
    rows.push({ event, startDay: eventStartDay, endDay: eventEndDay });
  }

  const daySlots: number[] = new Array(gridDays).fill(0);
  const positioned: AllDayPositionedEvent[] = [];
  const overflowCounts = new Map<number, number>();

  for (const { event, startDay, endDay } of rows) {
    let maxSlotInRange = 0;
    for (let d = startDay; d <= endDay; d++) {
      maxSlotInRange = Math.max(maxSlotInRange, daySlots[d]!);
    }

    const row = maxSlotInRange;

    if (maxPerDay !== undefined && row >= maxPerDay) {
      for (let d = startDay; d <= endDay; d++) {
        overflowCounts.set(d, (overflowCounts.get(d) ?? 0) + 1);
      }
      continue;
    }

    for (let d = startDay; d <= endDay; d++) {
      daySlots[d] = row + 1;
    }

    positioned.push({
      event,
      startDay,
      spanDays: endDay - startDay + 1,
      row,
    });
  }

  return { positioned, overflowCounts };
}

export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((event) => {
    if (event.allDay) {
      const eventStart = startOfDay(event.start);
      const eventEnd = startOfDay(event.end);
      const dayStart = startOfDay(day);
      return dayStart.getTime() >= eventStart.getTime() && dayStart.getTime() <= eventEnd.getTime();
    }
    return isSameDay(event.start, day) || isSameDay(event.end, day);
  });
}
