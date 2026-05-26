import { createContext, useContext } from 'react';
import type {
  CalendarEvent,
  RangeChangeInfo,
  SlotClickInfo,
  ViewType,
} from './types';

export interface CalendarContextValue {
  events: CalendarEvent[];
  date: Date;
  view: ViewType;
  locale: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  maxEventsPerDay: number;
  navigate: (direction: -1 | 0 | 1) => void;
  setView: (view: ViewType) => void;
  setDate: (date: Date) => void;
  onEventClick?: ((event: CalendarEvent) => void) | undefined;
  onSlotClick?: ((info: SlotClickInfo) => void) | undefined;
  onRangeChange?: ((info: RangeChangeInfo) => void) | undefined;
}

export const CalendarContext = createContext<CalendarContextValue | null>(null);

export function useCalendarContext(): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error(
      '[@vspro/calendar] Component must be used within <Calendar.Root>. ' +
        'Wrap your calendar components in <Calendar.Root> or use the <Calendar> shorthand.',
    );
  }
  return ctx;
}
