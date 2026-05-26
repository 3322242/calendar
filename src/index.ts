export { Root } from './components/Root';
export {
  Header,
  NavPrev,
  NavNext,
  NavToday,
  Title,
  ViewSwitcher,
} from './components/Header';
export { MonthGrid } from './components/MonthGrid';
export { WeekGrid } from './components/WeekGrid';
export { DayGrid } from './components/DayGrid';
export { Event } from './components/Event';

export { useCalendar } from './hooks/useCalendar';

export { CalendarContext, useCalendarContext } from './core/store';

export type {
  CalendarEvent,
  CalendarProps,
  ViewType,
  SlotClickInfo,
  RangeChangeInfo,
  PositionedEvent,
  AllDayPositionedEvent,
} from './core/types';

export {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  addHours,
  addMinutes,
  isSameDay,
  isSameMonth,
  isToday,
  daysInMonth,
  diffInMinutes,
  diffInDays,
  eachDayOfRange,
  monthGridRange,
  weekRange,
  dayRange,
  formatMonthYear,
  formatWeekRange,
  formatDayDate,
  formatTime,
} from './core/date-utils';

export { layoutTimedEvents, layoutAllDayEvents, getEventsForDay } from './core/event-layout';

import { Root } from './components/Root';
import {
  Header,
  NavPrev,
  NavNext,
  NavToday,
  Title,
  ViewSwitcher,
} from './components/Header';
import { MonthGrid } from './components/MonthGrid';
import { WeekGrid } from './components/WeekGrid';
import { DayGrid } from './components/DayGrid';
import { Event } from './components/Event';

export const Calendar = Object.assign(Root, {
  Root,
  Header,
  NavPrev,
  NavNext,
  NavToday,
  Title,
  ViewSwitcher,
  MonthGrid,
  WeekGrid,
  DayGrid,
  Event,
});
