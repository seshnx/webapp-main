import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Standard styles

// 1. Configure the localizer
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

export default function BookingCalendar({ events, onSelectSlot, onSelectEvent }) {
  
  // 2. Transform your Firestore booking data into Calendar events
  // Events must have { title, start, end }
  const calendarEvents = useMemo(() => {
      return events.map(booking => ({
          id: booking.id,
          title: booking.targetName || 'Session', // or senderName depending on view
          start: booking.date ? new Date(booking.date) : new Date(), 
          end: booking.date ? new Date(new Date(booking.date).getTime() + (booking.duration * 60 * 60 * 1000)) : new Date(),
          resource: booking
      }))
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
        onSelectSlot={onSelectSlot} // Handle clicking empty space (Create Booking)
        onSelectEvent={onSelectEvent} // Handle clicking an event (View Details)
        views={['month', 'week', 'day']}
        defaultView='week'
        // Tailwind Customization Helper
        eventPropGetter={(event) => ({
            className: `bg-brand-blue text-white rounded-md border-none text-xs`
        })}
      />
    </div>
  );
}
