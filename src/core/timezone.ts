export function toTimezone(date: Date, timezone: string): Date {
  const str = date.toLocaleString('en-US', { timeZone: timezone });
  return new Date(str);
}

export function formatTimeInZone(
  date: Date,
  locale: string,
  timezone?: string,
): string {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  if (timezone) options.timeZone = timezone;
  return new Intl.DateTimeFormat(locale === 'default' ? undefined : locale, options).format(date);
}

export function formatDateInZone(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions,
  timezone?: string,
): string {
  const opts = { ...options };
  if (timezone) opts.timeZone = timezone;
  return new Intl.DateTimeFormat(locale === 'default' ? undefined : locale, opts).format(date);
}
