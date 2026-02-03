import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo, EventProps } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Standard styles

// Configure the localizer
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

/**
 * Booking event interface
 */
export interface BookingEvent {
  id: string;
  date: string;
  duration: number;
  targetName?: string;
  [key: string]: any;
}

/**
 * Calendar event interface
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: BookingEvent;
}

/**
 * Booking calendar component props
 */
export interface BookingCalendarProps {
  /** Array of booking events */
  events: BookingEvent[];
  /** Handle clicking empty space */
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  /** Handle clicking an event */
  onSelectEvent?: (event: CalendarEvent) => void;
}

/**
 * Booking Calendar Component
 *
 * Displays bookings in a calendar view using react-big-calendar.
 *
 * @param props - Booking calendar props
 * @returns Calendar component
 */
export default function BookingCalendar({
  events,
  onSelectSlot,
  onSelectEvent
}: BookingCalendarProps): React.ReactElement {
  // Transform booking data into Calendar events
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return events.map(booking => ({
      id: booking.id,
      title: booking.targetName || 'Session',
      start: booking.date ? new Date(booking.date) : new Date(),
      end: booking.date ? new Date(new Date(booking.date).getTime() + (booking.duration * 60 * 60 * 1000)) : new Date(),
      resource: booking
    }));
  }, [events]);

  return (
    <div className="h-[600px] bg-white dark:bg-dark-card rounded-xl p-4 text-gray-800 dark:text-gray-200">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        views={['month', 'week', 'day']}
        defaultView='week'
        eventPropGetter={(event: CalendarEvent) => ({
          className: `bg-brand-blue text-white rounded-md border-none text-xs`
        })}
      />
    </div>
  );
}
