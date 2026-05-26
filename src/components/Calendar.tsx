import type { CalendarProps } from '../core/types';
import { useCalendarContext } from '../core/store';
import { DayGrid } from './DayGrid';
import { Header, NavNext, NavPrev, NavToday, Title, ViewSwitcher } from './Header';
import { MonthGrid } from './MonthGrid';
import { Root } from './Root';
import { WeekGrid } from './WeekGrid';

function ActiveView() {
  const { view } = useCalendarContext();
  switch (view) {
    case 'month':
      return <MonthGrid />;
    case 'week':
      return <WeekGrid />;
    case 'day':
      return <DayGrid />;
  }
}

export function Calendar(props: CalendarProps) {
  return (
    <Root {...props}>
      <Header>
        <NavPrev />
        <NavToday />
        <NavNext />
        <Title />
        <ViewSwitcher />
      </Header>
      <ActiveView />
    </Root>
  );
}
