import { describe, expect, test } from 'bun:test';
import { expandRecurring, type RecurringCalendarEvent } from './recurrence';

function makeRecurring(overrides: Partial<RecurringCalendarEvent> & { id: string }): RecurringCalendarEvent {
  return {
    title: `Event ${overrides.id}`,
    start: new Date(2026, 4, 26, 9, 0),
    end: new Date(2026, 4, 26, 10, 0),
    ...overrides,
  };
}

describe('expandRecurring', () => {
  test('non-recurring event passes through', () => {
    const events = [makeRecurring({ id: '1' })];
    const result = expandRecurring(events, new Date(2026, 4, 25), new Date(2026, 4, 30));
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('1');
  });

  test('daily recurrence generates instances', () => {
    const events = [
      makeRecurring({
        id: 'daily',
        start: new Date(2026, 4, 26, 9, 0),
        end: new Date(2026, 4, 26, 10, 0),
        recurrence: { frequency: 'daily', count: 5 },
      }),
    ];
    const result = expandRecurring(events, new Date(2026, 4, 25), new Date(2026, 5, 1));
    expect(result).toHaveLength(5);
    expect(result[0]!.start.getDate()).toBe(26);
    expect(result[1]!.start.getDate()).toBe(27);
    expect(result[4]!.start.getDate()).toBe(30);
  });

  test('weekly recurrence with interval=2', () => {
    const events = [
      makeRecurring({
        id: 'biweekly',
        start: new Date(2026, 4, 26, 9, 0),
        end: new Date(2026, 4, 26, 10, 0),
        recurrence: { frequency: 'weekly', interval: 2, count: 3 },
      }),
    ];
    const result = expandRecurring(events, new Date(2026, 4, 1), new Date(2026, 6, 1));
    expect(result).toHaveLength(3);
    expect(result[1]!.start.getDate()).toBe(9); // June 9 = +14 days
  });

  test('until date stops recurrence', () => {
    const events = [
      makeRecurring({
        id: 'until',
        start: new Date(2026, 4, 26, 9, 0),
        end: new Date(2026, 4, 26, 10, 0),
        recurrence: { frequency: 'daily', until: new Date(2026, 4, 28) },
      }),
    ];
    const result = expandRecurring(events, new Date(2026, 4, 25), new Date(2026, 5, 1));
    expect(result).toHaveLength(3); // 26, 27, 28
  });

  test('excludeDates skips instances', () => {
    const events = [
      makeRecurring({
        id: 'exclude',
        start: new Date(2026, 4, 26, 9, 0),
        end: new Date(2026, 4, 26, 10, 0),
        recurrence: {
          frequency: 'daily',
          count: 4,
          excludeDates: [new Date(2026, 4, 27)],
        },
      }),
    ];
    const result = expandRecurring(events, new Date(2026, 4, 25), new Date(2026, 5, 1));
    expect(result).toHaveLength(3); // 26, 28, 29 (27 excluded)
    expect(result.every((e) => e.start.getDate() !== 27)).toBe(true);
  });

  test('monthly recurrence', () => {
    const events = [
      makeRecurring({
        id: 'monthly',
        start: new Date(2026, 0, 15, 9, 0),
        end: new Date(2026, 0, 15, 10, 0),
        recurrence: { frequency: 'monthly', count: 6 },
      }),
    ];
    const result = expandRecurring(events, new Date(2026, 0, 1), new Date(2026, 6, 1));
    expect(result).toHaveLength(6);
    expect(result[0]!.start.getMonth()).toBe(0);
    expect(result[5]!.start.getMonth()).toBe(5);
  });

  test('instances get unique ids with parent reference', () => {
    const events = [
      makeRecurring({
        id: 'parent',
        recurrence: { frequency: 'daily', count: 2 },
      }),
    ];
    const result = expandRecurring(events, new Date(2026, 4, 25), new Date(2026, 5, 1));
    expect(result[0]!.id).not.toBe(result[1]!.id);
    expect(result[0]!.data?._recurringParentId).toBe('parent');
  });
});
