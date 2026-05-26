import type { CalendarEvent } from './types';

export interface DragState {
  event: CalendarEvent;
  type: 'move' | 'resize';
  startY: number;
  startTop: number;
  startHeight: number;
  slotHeight: number;
  dayStart: Date;
  columnElement: HTMLElement;
}

export interface DragResult {
  event: CalendarEvent;
  newStart: Date;
  newEnd: Date;
}

export function calculateDragResult(
  state: DragState,
  currentY: number,
  snapMinutes: number = 15,
): DragResult {
  const deltaY = currentY - state.startY;
  const deltaSlots = Math.round(deltaY / state.slotHeight);
  const deltaMs = deltaSlots * snapMinutes * 60_000;

  if (state.type === 'move') {
    const newStart = new Date(state.event.start.getTime() + deltaMs);
    const duration = state.event.end.getTime() - state.event.start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);
    return { event: state.event, newStart, newEnd };
  }

  // resize — only change end
  const minDuration = snapMinutes * 60_000;
  const newEndMs = Math.max(
    state.event.start.getTime() + minDuration,
    state.event.end.getTime() + deltaMs,
  );
  return {
    event: state.event,
    newStart: state.event.start,
    newEnd: new Date(newEndMs),
  };
}

export function getSlotHeight(column: HTMLElement): number {
  const slot = column.querySelector('[data-cal-slot]');
  return slot ? slot.getBoundingClientRect().height : 30;
}
