import { describe, expect, test } from 'bun:test';
import {
  addDays,
  addMonths,
  daysInMonth,
  diffInDays,
  diffInMinutes,
  eachDayOfRange,
  endOfDay,
  endOfMonth,
  isSameDay,
  isSameMonth,
  monthGridRange,
  startOfDay,
  startOfMonth,
  startOfWeek,
  weekRange,
} from './date-utils';

describe('startOfDay', () => {
  test('zeroes time', () => {
    const d = startOfDay(new Date(2026, 4, 26, 14, 30, 45));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getDate()).toBe(26);
  });
});

describe('endOfDay', () => {
  test('sets to 23:59:59.999', () => {
    const d = endOfDay(new Date(2026, 4, 26));
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
  });
});

describe('startOfWeek', () => {
  test('Monday start (weekStartsOn=1)', () => {
    const wed = new Date(2026, 4, 27); // Wednesday
    const mon = startOfWeek(wed, 1);
    expect(mon.getDay()).toBe(1); // Monday
    expect(mon.getDate()).toBe(25);
  });

  test('Sunday start (weekStartsOn=0)', () => {
    const wed = new Date(2026, 4, 27); // Wednesday
    const sun = startOfWeek(wed, 0);
    expect(sun.getDay()).toBe(0); // Sunday
    expect(sun.getDate()).toBe(24);
  });

  test('already on start day', () => {
    const mon = new Date(2026, 4, 25); // Monday
    const result = startOfWeek(mon, 1);
    expect(result.getDate()).toBe(25);
  });
});

describe('addDays', () => {
  test('positive', () => {
    const d = addDays(new Date(2026, 0, 30), 3);
    expect(d.getDate()).toBe(2);
    expect(d.getMonth()).toBe(1); // Feb
  });

  test('negative', () => {
    const d = addDays(new Date(2026, 1, 2), -3);
    expect(d.getDate()).toBe(30);
    expect(d.getMonth()).toBe(0); // Jan
  });
});

describe('addMonths', () => {
  test('normal', () => {
    const d = addMonths(new Date(2026, 0, 15), 2);
    expect(d.getMonth()).toBe(2); // March
    expect(d.getDate()).toBe(15);
  });

  test('clamps day — Jan 31 + 1 month → Feb 28', () => {
    const d = addMonths(new Date(2026, 0, 31), 1);
    expect(d.getMonth()).toBe(1); // Feb
    expect(d.getDate()).toBe(28);
  });

  test('leap year — Jan 31 + 1 month in 2024 → Feb 29', () => {
    const d = addMonths(new Date(2024, 0, 31), 1);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(29);
  });
});

describe('isSameDay', () => {
  test('same day different time', () => {
    expect(isSameDay(new Date(2026, 4, 26, 10), new Date(2026, 4, 26, 22))).toBe(true);
  });

  test('different day', () => {
    expect(isSameDay(new Date(2026, 4, 26), new Date(2026, 4, 27))).toBe(false);
  });
});

describe('isSameMonth', () => {
  test('same month different day', () => {
    expect(isSameMonth(new Date(2026, 4, 1), new Date(2026, 4, 31))).toBe(true);
  });
});

describe('daysInMonth', () => {
  test('February non-leap', () => {
    expect(daysInMonth(new Date(2026, 1, 1))).toBe(28);
  });

  test('February leap', () => {
    expect(daysInMonth(new Date(2024, 1, 1))).toBe(29);
  });

  test('January', () => {
    expect(daysInMonth(new Date(2026, 0, 1))).toBe(31);
  });
});

describe('diffInMinutes', () => {
  test('1 hour', () => {
    const a = new Date(2026, 4, 26, 10, 0);
    const b = new Date(2026, 4, 26, 11, 0);
    expect(diffInMinutes(a, b)).toBe(60);
  });
});

describe('diffInDays', () => {
  test('3 days', () => {
    const a = new Date(2026, 4, 23);
    const b = new Date(2026, 4, 26);
    expect(diffInDays(a, b)).toBe(3);
  });
});

describe('eachDayOfRange', () => {
  test('returns correct count', () => {
    const start = new Date(2026, 4, 25);
    const end = new Date(2026, 4, 31);
    expect(eachDayOfRange(start, end)).toHaveLength(7);
  });
});

describe('monthGridRange', () => {
  test('always returns 42 days (6 weeks)', () => {
    const { start, end } = monthGridRange(new Date(2026, 4, 1), 1);
    const days = diffInDays(start, end) + 1;
    expect(days).toBe(42);
  });

  test('May 2026, Monday start', () => {
    const { start } = monthGridRange(new Date(2026, 4, 15), 1);
    expect(start.getDay()).toBe(1); // Monday
  });
});

describe('weekRange', () => {
  test('7 days', () => {
    const { start, end } = weekRange(new Date(2026, 4, 27), 1);
    const days = diffInDays(start, end) + 1;
    expect(days).toBe(7);
  });
});
