export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  data?: Record<string, unknown>;
}

export type ViewType = 'month' | 'week' | 'day';

export interface SlotClickInfo {
  start: Date;
  end: Date;
  allDay: boolean;
}

export interface RangeChangeInfo {
  start: Date;
  end: Date;
  view: ViewType;
}

export interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  column: number;
  totalColumns: number;
}

export interface AllDayPositionedEvent {
  event: CalendarEvent;
  startDay: number;
  spanDays: number;
  row: number;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  view?: ViewType;
  defaultView?: ViewType;
  date?: Date;
  defaultDate?: Date;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  maxEventsPerDay?: number;
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (info: SlotClickInfo) => void;
  onRangeChange?: (info: RangeChangeInfo) => void;
  onViewChange?: (view: ViewType) => void;
  onDateChange?: (date: Date) => void;
}
