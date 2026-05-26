# @vspro/calendar

Headless React event calendar with compound components, CSS custom properties theming, and zero runtime dependencies.

**Status:** Early development (v0.0.1)

## Features

- **Headless compound components** — like Radix UI, but for calendars
- **Month, Week, Day views** — with event layout engine
- **CSS custom properties** — theme everything, no CSS-in-JS runtime
- **Controlled + Uncontrolled** — `date`/`defaultDate` + `view`/`defaultView`
- **Accessible** — ARIA roles, keyboard navigation
- **Zero dependencies** — date math built-in (~2-3 KB)
- **SSR-safe** — no `window`/`document` in module scope
- **TypeScript-first** — strict types, full IntelliSense

## Quick Start

```tsx
import { Calendar } from '@vspro/calendar';
import '@vspro/calendar/theme';

function App() {
  return (
    <Calendar
      events={[
        { id: '1', title: 'Meeting', start: new Date(), end: new Date() },
      ]}
      onEventClick={(event) => console.log(event)}
      onSlotClick={(info) => console.log(info)}
    />
  );
}
```

## Compound Components

```tsx
import { Calendar } from '@vspro/calendar';
import '@vspro/calendar/theme';

function MyCalendar({ events }) {
  return (
    <Calendar.Root events={events} defaultView="month">
      <Calendar.Header>
        <Calendar.NavPrev />
        <Calendar.NavToday />
        <Calendar.NavNext />
        <Calendar.Title />
        <Calendar.ViewSwitcher />
      </Calendar.Header>
      <Calendar.MonthGrid />
    </Calendar.Root>
  );
}
```

## Theming

Override CSS custom properties:

```css
:root {
  --cal-accent: #8b5cf6;
  --cal-surface: #1a1a2e;
  --cal-text: #eaeaea;
}
```

Or use the vspro preset:

```tsx
import '@vspro/calendar/themes/vspro';
```

## License

MIT
