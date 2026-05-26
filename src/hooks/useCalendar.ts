import { useCalendarContext } from '../core/store';

export function useCalendar() {
  const ctx = useCalendarContext();
  return {
    date: ctx.date,
    view: ctx.view,
    events: ctx.events,
    locale: ctx.locale,
    timezone: ctx.timezone,
    weekStartsOn: ctx.weekStartsOn,
    labels: ctx.labels,
    navigate: ctx.navigate,
    setView: ctx.setView,
    setDate: ctx.setDate,
  };
}
