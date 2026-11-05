import { useMemo } from 'react';
import moment from 'moment';
import { momentLocalizer, Views } from 'react-big-calendar';
import ShadcnBigCalendar from '@/components/shadcn-big-calendar/shadcn-big-calendar';
import type { Session } from '../pages/PlanningPage';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import '@/components/shadcn-big-calendar/shadcn-big-calendar.css';

const localizer = momentLocalizer(moment);

// Map session status → event variant class
const statusToClass: Record<string, string> = {
  available: 'event-variant-secondary',   // green
  partial: 'event-variant-primary',        // gold
  full: 'event-variant-destructive',       // red
  blocked: 'event-variant-destructive',    // red for closed/blocked slots
};

interface PlanningCalendarProps {
  sessions: Session[];
  date: Date;
  view: 'week' | 'day';
  onNavigate: (date: Date) => void;
  onView: (view: 'week' | 'day') => void;
  onSelectEvent: (session: Session) => void;
  onSelectSlot: (slot: { start: Date; end: Date }) => void;
}

export default function PlanningCalendar({
  sessions,
  date,
  view,
  onNavigate,
  onView,
  onSelectEvent,
  onSelectSlot,
}: PlanningCalendarProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const events = useMemo(
    () =>
      sessions.map((s) => ({
        id: s.id,
        title: `${s.time} — ${s.course || 'Créneau'}${s.players.length > 0 ? ` (${s.players.length}p)` : ''}`,
        start: new Date(s.start),
        end: new Date(s.end),
        resource: s,
      })),
    [sessions]
  );

  // Time boundaries for each day column (6:00 to 21:00)
  const minTime = useMemo(() => new Date(1970, 0, 1, 6, 0, 0), []);
  const maxTime = useMemo(() => new Date(1970, 0, 1, 21, 0, 0), []);

  const eventPropGetter = (event: { resource?: Session }) => {
    const status = event.resource?.status ?? 'available';
    return { className: statusToClass[status] ?? 'event-variant-primary' };
  };

  return (
    <div
      className="rounded-lg border border-border bg-surface p-2"
      style={{ height: isDesktop ? 'min(140vh, 1800px)' : 'min(120vh, 1400px)' }}
    >
      <ShadcnBigCalendar
        localizer={localizer}
        events={events}
        date={date}
        view={view}
        onNavigate={onNavigate}
        onView={(v) => onView(v as 'week' | 'day')}
        views={[Views.WEEK, Views.DAY]}
        culture="fr"
        step={30}
        timeslots={2}
        min={minTime}
        max={maxTime}
        dayLayoutAlgorithm="no-overlap"
        eventPropGetter={eventPropGetter as never}
        onSelectEvent={(event: { resource?: Session }) => onSelectEvent(event.resource as Session)}
        onSelectSlot={onSelectSlot}
        selectable
        style={{ height: '100%' }}
      />
    </div>
  );
}