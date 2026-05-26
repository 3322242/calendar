import { useEffect, useState } from 'react';
import { isToday } from '../core/date-utils';

export function CurrentTimeLine({ day }: { day: Date }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!isToday(day)) return null;

  const minutes = now.getHours() * 60 + now.getMinutes();
  const top = (minutes / 1440) * 100;

  return (
    <div
      className="cal-current-time"
      data-cal-current-time
      style={{ position: 'absolute', top: `${top}%`, left: 0, right: 0, zIndex: 5 }}
      aria-hidden="true"
    >
      <div className="cal-current-time-dot" data-cal-current-time-dot />
      <div className="cal-current-time-line" data-cal-current-time-line />
    </div>
  );
}
