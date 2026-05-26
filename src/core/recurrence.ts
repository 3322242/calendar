import { addDays, addMonths, isSameDay, startOfDay } from './date-utils';
import type { CalendarEvent } from './types';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number;
  until?: Date;
  count?: number;
  excludeDates?: Date[];
}

export interface RecurringCalendarEvent extends CalendarEvent {
  recurrence?: RecurrenceRule;
}

export function expandRecurring(
  events: RecurringCalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): CalendarEvent[] {
  const result: CalendarEvent[] = [];

  for (const event of events) {
    if (!event.recurrence) {
      result.push(event);
      continue;
    }

    const { frequency, interval = 1, until, count, excludeDates = [] } = event.recurrence;
    const duration = event.end.getTime() - event.start.getTime();
    let current = new Date(event.start);
    let occurrences = 0;
    const maxIterations = 1000;
    let iterations = 0;

    while (iterations++ < maxIterations) {
      if (until && startOfDay(current) > startOfDay(until)) break;
      if (count !== undefined && occurrences >= count) break;

      const instanceEnd = new Date(current.getTime() + duration);

      if (instanceEnd >= rangeStart && current <= rangeEnd) {
        const isExcluded = excludeDates.some((d) => isSameDay(d, current));
        if (!isExcluded) {
          result.push({
            ...event,
            id: `${event.id}-${current.getTime()}`,
            start: new Date(current),
            end: instanceEnd,
            data: { ...event.data, _recurringParentId: event.id, _occurrenceDate: new Date(current) },
          });
        }
      }

      if (current > rangeEnd && instanceEnd > rangeEnd) break;

      occurrences++;
      current = advanceDate(current, frequency, interval);
    }
  }

  return result;
}

function advanceDate(date: Date, frequency: RecurrenceFrequency, interval: number): Date {
  switch (frequency) {
    case 'daily':
      return addDays(date, interval);
    case 'weekly':
      return addDays(date, interval * 7);
    case 'monthly':
      return addMonths(date, interval);
    case 'yearly':
      return addMonths(date, interval * 12);
  }
}
