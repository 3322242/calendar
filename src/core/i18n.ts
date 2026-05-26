export interface CalendarLabels {
  today: string;
  month: string;
  week: string;
  day: string;
  allDay: string;
  more: (count: number) => string;
}

const en: CalendarLabels = {
  today: 'Today',
  month: 'Month',
  week: 'Week',
  day: 'Day',
  allDay: 'All day',
  more: (n) => `+${n} more`,
};

const uk: CalendarLabels = {
  today: 'Сьогодні',
  month: 'Місяць',
  week: 'Тиждень',
  day: 'День',
  allDay: 'Весь день',
  more: (n) => `+${n} ще`,
};

const de: CalendarLabels = {
  today: 'Heute',
  month: 'Monat',
  week: 'Woche',
  day: 'Tag',
  allDay: 'Ganztägig',
  more: (n) => `+${n} mehr`,
};

const fr: CalendarLabels = {
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  allDay: 'Toute la journée',
  more: (n) => `+${n} de plus`,
};

const es: CalendarLabels = {
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  allDay: 'Todo el día',
  more: (n) => `+${n} más`,
};

const builtIn: Record<string, CalendarLabels> = { en, uk, de, fr, es };

export function resolveLabels(
  locale: string,
  custom?: Partial<CalendarLabels>,
): CalendarLabels {
  const lang = locale === 'default' ? 'en' : locale.split('-')[0]!;
  const base = builtIn[lang] ?? en;
  if (!custom) return base;
  return { ...base, ...custom };
}
