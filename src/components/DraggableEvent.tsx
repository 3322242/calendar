import { useCallback, useRef, useState } from 'react';
import { calculateDragResult, getSlotHeight, type DragState } from '../core/drag';
import { useCalendarContext } from '../core/store';
import type { CalendarEvent, PositionedEvent } from '../core/types';

interface DraggableEventProps {
  event: CalendarEvent;
  positioned: PositionedEvent;
  className?: string;
}

export function DraggableEvent({ event, positioned, className }: DraggableEventProps) {
  const { onEventClick, onEventDrop, onEventResize } = useCalendarContext();
  const [dragOffset, setDragOffset] = useState<{ dy: number; dh: number } | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const movedRef = useRef(false);

  const colorStyle = event.color
    ? ({ '--cal-event-color': event.color } as React.CSSProperties)
    : undefined;

  const top = positioned.top * 100;
  const height = positioned.height * 100;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, type: 'move' | 'resize') => {
      if (!onEventDrop && !onEventResize) return;
      if (type === 'move' && !onEventDrop) return;
      if (type === 'resize' && !onEventResize) return;

      const column = (e.currentTarget as HTMLElement).closest('[data-cal-day-col]') as HTMLElement;
      if (!column) return;

      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      movedRef.current = false;

      dragRef.current = {
        event,
        type,
        startY: e.clientY,
        startTop: top,
        startHeight: height,
        slotHeight: getSlotHeight(column),
        dayStart: new Date(),
        columnElement: column,
      };
    },
    [event, top, height, onEventDrop, onEventResize],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const state = dragRef.current;
    if (!state) return;
    e.preventDefault();

    const deltaY = e.clientY - state.startY;
    if (Math.abs(deltaY) > 3) movedRef.current = true;

    const snapPx = state.slotHeight / 2;
    const snappedDelta = Math.round(deltaY / snapPx) * snapPx;
    const columnHeight = state.columnElement.getBoundingClientRect().height;
    const deltaPct = (snappedDelta / columnHeight) * 100;

    if (state.type === 'move') {
      setDragOffset({ dy: deltaPct, dh: 0 });
    } else {
      setDragOffset({ dy: 0, dh: deltaPct });
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const state = dragRef.current;
      if (!state) return;

      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      dragRef.current = null;
      setDragOffset(null);

      if (!movedRef.current) {
        onEventClick?.(event);
        return;
      }

      const result = calculateDragResult(state, e.clientY);

      if (state.type === 'move') {
        onEventDrop?.(result.event, result.newStart, result.newEnd);
      } else {
        onEventResize?.(result.event, result.newStart, result.newEnd);
      }
    },
    [event, onEventClick, onEventDrop, onEventResize],
  );

  const isDragging = dragOffset !== null;
  const displayTop = isDragging ? top + dragOffset.dy : top;
  const displayHeight = isDragging ? height + dragOffset.dh : height;
  const canDrag = !!onEventDrop;
  const canResize = !!onEventResize;

  return (
    <div
      className={`cal-event ${className ?? ''} ${isDragging ? 'cal-event-dragging' : ''}`}
      data-cal-event
      data-cal-event-id={String(event.id)}
      data-dragging={isDragging || undefined}
      style={{
        ...colorStyle,
        position: 'absolute',
        top: `${displayTop}%`,
        height: `${displayHeight}%`,
        left: `${positioned.left * 100}%`,
        width: `${positioned.width * 100}%`,
        cursor: canDrag ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        zIndex: isDragging ? 10 : 2,
        opacity: isDragging ? 0.85 : 1,
        transition: isDragging ? 'none' : 'opacity 100ms ease',
        touchAction: 'none',
      }}
      onPointerDown={(e) => handlePointerDown(e, 'move')}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="button"
      aria-label={event.title}
    >
      <span className="cal-event-title" data-cal-event-title>
        {event.title}
      </span>
      {canResize && (
        <div
          className="cal-event-resize-handle"
          data-cal-resize-handle
          onPointerDown={(e) => {
            e.stopPropagation();
            handlePointerDown(e, 'resize');
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      )}
    </div>
  );
}
