/**
 * Universal Calendar Integration Utilities
 * Supports Google Calendar, Outlook Web, Office 365, Yahoo Calendar, and Apple Calendar / .ics downloads.
 */

export interface CalendarEventDetails {
  title: string;
  description?: string;
  location?: string;
  startDate: Date | string;
  endDate: Date | string;
  url?: string;
  organizerName?: string;
  organizerEmail?: string;
}

/**
 * Format a Date to UTC string in YYYYMMDDTHHmmssZ format for calendar URLs
 */
function formatDateToUTC(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    return new Date().toISOString().replace(/-|:|\.\d+/g, '');
  }
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

/**
 * Generate Google Calendar direct web URL
 */
export function getGoogleCalendarUrl(event: CalendarEventDetails): string {
  const startUTC = formatDateToUTC(event.startDate);
  const endUTC = formatDateToUTC(event.endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startUTC}/${endUTC}`,
    details: event.description || '',
    location: event.location || 'SeshNx Studio',
    sprop: event.url ? `website:${event.url}` : 'website:https://seshnx.com',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook.com (Live) direct web URL
 */
export function getOutlookCalendarUrl(event: CalendarEventDetails): string {
  const start = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate;
  const end = typeof event.endDate === 'string' ? new Date(event.endDate) : event.endDate;

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: isNaN(start.getTime()) ? new Date().toISOString() : start.toISOString(),
    enddt: isNaN(end.getTime()) ? new Date(Date.now() + 7200000).toISOString() : end.toISOString(),
    body: event.description || '',
    location: event.location || 'SeshNx Studio',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Office 365 direct web URL
 */
export function getOffice365CalendarUrl(event: CalendarEventDetails): string {
  const start = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate;
  const end = typeof event.endDate === 'string' ? new Date(event.endDate) : event.endDate;

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: isNaN(start.getTime()) ? new Date().toISOString() : start.toISOString(),
    enddt: isNaN(end.getTime()) ? new Date(Date.now() + 7200000).toISOString() : end.toISOString(),
    body: event.description || '',
    location: event.location || 'SeshNx Studio',
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Yahoo Calendar direct web URL
 */
export function getYahooCalendarUrl(event: CalendarEventDetails): string {
  const startUTC = formatDateToUTC(event.startDate);
  const endUTC = formatDateToUTC(event.endDate);

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: startUTC,
    et: endUTC,
    desc: event.description || '',
    in_loc: event.location || 'SeshNx Studio',
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

/**
 * Generate standard RFC 5545 iCalendar (.ics) string content
 */
export function generateIcsContent(event: CalendarEventDetails): string {
  const startUTC = formatDateToUTC(event.startDate);
  const endUTC = formatDateToUTC(event.endDate);
  const nowUTC = formatDateToUTC(new Date());
  const uid = `seshnx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@seshnx.com`;

  // Escape special chars in text
  const cleanSummary = (event.title || 'Studio Session').replace(/[\n\r]/g, ' ');
  const cleanDescription = (event.description || '').replace(/\n/g, '\\n').replace(/,/g, '\\,');
  const cleanLocation = (event.location || 'SeshNx Studio').replace(/[\n\r]/g, ' ');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SeshNx Audio Ecosystem//Studio Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUTC}`,
    `DTSTART:${startUTC}`,
    `DTEND:${endUTC}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'DESCRIPTION:Reminder: Studio Session starts in 1 hour',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Trigger an immediate .ics file download in the browser (works for Apple Calendar, Google Calendar import, Outlook)
 */
export function downloadIcsFile(event: CalendarEventDetails, filename = 'seshnx-session.ics'): void {
  const icsContent = generateIcsContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Helper to build calendar details from a SeshNx booking document
 */
export function formatBookingForCalendar(booking: any, perspective: 'talent' | 'client' | 'studio' = 'talent'): CalendarEventDetails {
  const sessionDate = booking.date || booking.sessionDate || booking.startTime || new Date().toISOString();
  
  // Calculate start & end
  let startDate = new Date(sessionDate);
  if (isNaN(startDate.getTime())) startDate = new Date();

  // Handle custom time strings if available (e.g. "14:00")
  if (booking.time && typeof booking.time === 'string' && booking.time.includes(':')) {
    const [hours, minutes] = booking.time.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      startDate.setHours(hours, minutes, 0, 0);
    }
  }

  const durationHours = Number(booking.duration) || Number(booking.hours) || 3;
  const endDate = new Date(startDate.getTime() + durationHours * 3600 * 1000);

  const studioName = booking.studioName || booking.roomName || 'SeshNx Studio';
  const otherParty = perspective === 'talent' 
    ? (booking.clientName || 'Client') 
    : (booking.talentName || booking.studioName || 'Producer/Engineer');

  const title = `Studio Session: ${booking.serviceType || 'Recording & Mix'} with ${otherParty}`;
  const location = booking.location || booking.roomName || studioName || 'SeshNx Studio';
  
  const description = [
    `SeshNx Confirmed Session`,
    `Service: ${booking.serviceType || 'Studio Recording'}`,
    `Location / Room: ${location}`,
    `Rate / Total: $${booking.totalPrice || booking.rate || '0'}`,
    booking.notes ? `Session Notes: ${booking.notes}` : '',
    `Booked via SeshNx: https://seshnx.com`
  ].filter(Boolean).join('\n');

  return {
    title,
    description,
    location,
    startDate,
    endDate,
    url: 'https://seshnx.com/creator-studio/bookings',
  };
}
