import { describe, expect, test } from 'bun:test';
import { getEventsForDay, layoutAllDayEvents, layoutTimedEvents } from './event-layout';
import type { CalendarEvent } from './types';

function makeEvent(overrides: Partial<CalendarEvent> & { id: string }): CalendarEvent {
  return {
    title: `Event ${overrides.id}`,
    start: new Date(2026, 4, 26, 9, 0),
    end: new Date(2026, 4, 26, 10, 0),
    ...overrides,
  };
}

describe('layoutTimedEvents', () => {
  test('empty events', () => {
    expect(layoutTimedEvents([], new Date(2026, 4, 26))).toEqual([]);
  });

  test('single event', () => {
    const events = [makeEvent({ id: '1' })];
    const result = layoutTimedEvents(events, new Date(2026, 4, 26));
    expect(result).toHaveLength(1);
    expect(result[0]!.column).toBe(0);
    expect(result[0]!.totalColumns).toBe(1);
    expect(result[0]!.width).toBe(1);
  });

  test('two overlapping events', () => {
    const events = [
      makeEvent({ id: '1', start: new Date(2026, 4, 26, 9, 0), end: new Date(2026, 4, 26, 10, 0) }),
      makeEvent({ id: '2', start: new Date(2026, 4, 26, 9, 30), end: new Date(2026, 4, 26, 10, 30) }),
    ];
    const result = layoutTimedEvents(events, new Date(2026, 4, 26));
    expect(result).toHaveLength(2);
    expect(result[0]!.totalColumns).toBe(2);
    expect(result[1]!.totalColumns).toBe(2);
    expect(result[0]!.column).toBe(0);
    expect(result[1]!.column).toBe(1);
    expect(result[0]!.width).toBeCloseTo(0.5);
  });

  test('non-overlapping events share column', () => {
    const events = [
      makeEvent({ id: '1', start: new Date(2026, 4, 26, 9, 0), end: new Date(2026, 4, 26, 10, 0) }),
      makeEvent({ id: '2', start: new Date(2026, 4, 26, 10, 0), end: new Date(2026, 4, 26, 11, 0) }),
    ];
    const result = layoutTimedEvents(events, new Date(2026, 4, 26));
    expect(result).toHaveLength(2);
    expect(result[0]!.column).toBe(0);
    expect(result[1]!.column).toBe(0);
    expect(result[0]!.totalColumns).toBe(1);
  });

  test('three cascading overlaps', () => {
    const events = [
      makeEvent({ id: '1', start: new Date(2026, 4, 26, 9, 0), end: new Date(2026, 4, 26, 11, 0) }),
      makeEvent({ id: '2', start: new Date(2026, 4, 26, 9, 30), end: new Date(2026, 4, 26, 10, 30) }),
      makeEvent({ id: '3', start: new Date(2026, 4, 26, 10, 0), end: new Date(2026, 4, 26, 12, 0) }),
    ];
    const result = layoutTimedEvents(events, new Date(2026, 4, 26));
    expect(result).toHaveLength(3);
    expect(result[0]!.totalColumns).toBe(3);
  });

  test('skips allDay events', () => {
    const events = [
      makeEvent({ id: '1', allDay: true }),
      makeEvent({ id: '2' }),
    ];
    const result = layoutTimedEvents(events, new Date(2026, 4, 26));
    expect(result).toHaveLength(1);
    expect(result[0]!.event.id).toBe('2');
  });

  test('minimum height for short events', () => {
    const events = [
      makeEvent({
        id: '1',
        start: new Date(2026, 4, 26, 9, 0),
        end: new Date(2026, 4, 26, 9, 5),
      }),
    ];
    const result = layoutTimedEvents(events, new Date(2026, 4, 26));
    expect(result[0]!.height).toBeGreaterThanOrEqual(15 / 1440);
  });
});

describe('layoutAllDayEvents', () => {
  test('empty', () => {
    const { positioned } = layoutAllDayEvents([], new Date(2026, 4, 25), 7);
    expect(positioned).toEqual([]);
  });

  test('single all-day event', () => {
    const events = [
      makeEvent({
        id: '1',
        allDay: true,
        start: new Date(2026, 4, 26),
        end: new Date(2026, 4, 26),
      }),
    ];
    const { positioned } = layoutAllDayEvents(events, new Date(2026, 4, 25), 7);
    expect(positioned).toHaveLength(1);
    expect(positioned[0]!.startDay).toBe(1);
    expect(positioned[0]!.spanDays).toBe(1);
    expect(positioned[0]!.row).toBe(0);
  });

  test('overflow with maxPerDay', () => {
    const events = [
      makeEvent({ id: '1', allDay: true, start: new Date(2026, 4, 26), end: new Date(2026, 4, 26) }),
      makeEvent({ id: '2', allDay: true, start: new Date(2026, 4, 26), end: new Date(2026, 4, 26) }),
      makeEvent({ id: '3', allDay: true, start: new Date(2026, 4, 26), end: new Date(2026, 4, 26) }),
    ];
    const { positioned, overflowCounts } = layoutAllDayEvents(
      events,
      new Date(2026, 4, 25),
      7,
      2,
    );
    expect(positioned).toHaveLength(2);
    expect(overflowCounts.get(1)).toBe(1);
  });

  test('multi-day event spans', () => {
    const events = [
      makeEvent({
        id: '1',
        allDay: true,
        start: new Date(2026, 4, 25),
        end: new Date(2026, 4, 27),
      }),
    ];
    const { positioned } = layoutAllDayEvents(events, new Date(2026, 4, 25), 7);
    expect(positioned[0]!.spanDays).toBe(3);
  });
});

describe('getEventsForDay', () => {
  test('finds timed event on that day', () => {
    const events = [
      makeEvent({ id: '1', start: new Date(2026, 4, 26, 9), end: new Date(2026, 4, 26, 10) }),
      makeEvent({ id: '2', start: new Date(2026, 4, 27, 9), end: new Date(2026, 4, 27, 10) }),
    ];
    const result = getEventsForDay(events, new Date(2026, 4, 26));
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('1');
  });

  test('finds all-day event spanning the day', () => {
    const events = [
      makeEvent({
        id: '1',
        allDay: true,
        start: new Date(2026, 4, 25),
        end: new Date(2026, 4, 27),
      }),
    ];
    const result = getEventsForDay(events, new Date(2026, 4, 26));
    expect(result).toHaveLength(1);
  });
});
