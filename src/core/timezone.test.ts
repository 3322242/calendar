import { describe, expect, test } from 'bun:test';
import { formatTimeInZone, toTimezone } from './timezone';

describe('toTimezone', () => {
  test('converts to different timezone', () => {
    const utcNoon = new Date('2026-05-26T12:00:00Z');
    const kyiv = toTimezone(utcNoon, 'Europe/Kyiv');
    expect(kyiv.getHours()).toBe(15); // UTC+3 in summer
  });

  test('converts to US Eastern', () => {
    const utcNoon = new Date('2026-05-26T12:00:00Z');
    const eastern = toTimezone(utcNoon, 'America/New_York');
    expect(eastern.getHours()).toBe(8); // UTC-4 in summer (EDT)
  });
});

describe('formatTimeInZone', () => {
  test('formats in locale without timezone', () => {
    const date = new Date(2026, 4, 26, 14, 30);
    const result = formatTimeInZone(date, 'en');
    expect(result).toContain('2');
    expect(result).toContain('30');
  });

  test('formats with explicit timezone', () => {
    const utcNoon = new Date('2026-05-26T12:00:00Z');
    const result = formatTimeInZone(utcNoon, 'en', 'America/New_York');
    expect(result).toContain('8');
    expect(result).toContain('00');
  });
});
