const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_MINUTE = 60_000;

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date: Date, weekStartsOn: number = 1): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function endOfWeek(date: Date, weekStartsOn: number = 1): Date {
  const d = startOfWeek(date, weekStartsOn);
  d.setDate(d.getDate() + 6);
  return endOfDay(d);
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0);
  }
  return d;
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * MS_PER_HOUR);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MS_PER_MINUTE);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}

export function isAfter(a: Date, b: Date): boolean {
  return a.getTime() > b.getTime();
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function diffInMinutes(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_MINUTE);
}

export function diffInDays(a: Date, b: Date): number {
  const aStart = startOfDay(a).getTime();
  const bStart = startOfDay(b).getTime();
  return Math.round((bStart - aStart) / MS_PER_DAY);
}

export function eachDayOfRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let current = startOfDay(start);
  const last = startOfDay(end);
  while (current.getTime() <= last.getTime()) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}

export function monthGridRange(date: Date, weekStartsOn: number = 1): { start: Date; end: Date } {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, weekStartsOn);
  const gridEnd = endOfWeek(monthEnd, weekStartsOn);
  const days = diffInDays(gridStart, gridEnd) + 1;
  const finalEnd = days < 42 ? addDays(gridStart, 41) : gridEnd;
  return { start: gridStart, end: endOfDay(finalEnd) };
}

export function weekRange(date: Date, weekStartsOn: number = 1): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, weekStartsOn),
    end: endOfWeek(date, weekStartsOn),
  };
}

export function dayRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

export function formatMonthYear(date: Date, locale: string = 'default'): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

export function formatWeekRange(start: Date, end: Date, locale: string = 'default'): string {
  const sameMonth = isSameMonth(start, end);
  const startFmt = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  }).format(start);
  const endFmt = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(end);
  return `${startFmt} – ${endFmt}`;
}

export function formatDayDate(date: Date, locale: string = 'default'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatTime(date: Date, locale: string = 'default'): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function getWeekStartFromLocale(locale: string = 'default'): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  try {
    const info = new Intl.Locale(locale === 'default' ? 'en' : locale);
    if ('weekInfo' in info) {
      const weekInfo = (info as Intl.Locale & { weekInfo: { firstDay: number } }).weekInfo;
      return (weekInfo.firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    }
  } catch {
    // fallback
  }
  return 1;
}
