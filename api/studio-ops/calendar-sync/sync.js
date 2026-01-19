import { query } from '../../../src/config/neon.js';

/**
 * Sync Bookings with Google Calendar (Two-way)
 * POST /api/studio-ops/calendar-sync/sync
 *
 * Body:
 * - studioId: Studio UUID (required)
 * - direction: 'to-google', 'from-google', or 'both' (default: 'both')
 *
 * Returns:
 * - syncedToGoogle: Count of bookings synced to Google Calendar
 * - syncedFromGoogle: Count of events synced from Google Calendar
 * - conflicts: Array of conflicting events
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { studioId, direction = 'both' } = req.body;

        // Validation
        if (!studioId) {
            return res.status(400).json({
                error: 'Missing required field: studioId'
            });
        }

        // Get sync settings
        const syncSettingsResult = await query(
            `SELECT * FROM google_calendar_sync WHERE studio_id = $1 AND is_connected = true`,
            [studioId]
        );

        if (syncSettingsResult.length === 0) {
            return res.status(404).json({
                error: 'Google Calendar not connected'
            });
        }

        const syncSettings = syncSettingsResult[0];

        // Validate access token
        if (!syncSettings.access_token) {
            return res.status(401).json({
                error: 'Access token not found',
                message: 'Please re-authenticate with Google Calendar'
            });
        }

        const results = {
            syncedToGoogle: 0,
            syncedFromGoogle: 0,
            conflicts: [],
            errors: []
        };

        // Sync TO Google Calendar
        if (direction === 'to-google' || direction === 'both') {
            try {
                const toGoogleResult = await syncToGoogleCalendar(studioId, syncSettings);
                results.syncedToGoogle = toGoogleResult.synced;
                results.errors.push(...toGoogleResult.errors);
            } catch (error) {
                results.errors.push({
                    type: 'to-google',
                    message: error.message
                });
            }
        }

        // Sync FROM Google Calendar
        if (direction === 'from-google' || direction === 'both') {
            try {
                const fromGoogleResult = await syncFromGoogleCalendar(studioId, syncSettings);
                results.syncedFromGoogle = fromGoogleResult.synced;
                results.conflicts.push(...fromGoogleResult.conflicts);
                results.errors.push(...fromGoogleResult.errors);
            } catch (error) {
                results.errors.push({
                    type: 'from-google',
                    message: error.message
                });
            }
        }

        // Update last synced timestamp
        await query(
            `UPDATE google_calendar_sync SET last_synced_at = NOW() WHERE studio_id = $1`,
            [studioId]
        );

        return res.status(200).json({
            success: true,
            data: results,
            message: `Sync completed: ${results.syncedToGoogle} to Google, ${results.syncedFromGoogle} from Google`
        });
    } catch (error) {
        console.error('Error syncing with Google Calendar:', error);
        return res.status(500).json({
            error: 'Failed to sync with Google Calendar',
            message: error.message
        });
    }
}

/**
 * Sync bookings TO Google Calendar
 */
async function syncToGoogleCalendar(studioId, syncSettings) {
    const result = { synced: 0, errors: [] };

    try {
        // Get bookings that need to be synced
        const bookingsResult = await query(
            `SELECT
                b.id,
                b.date,
                b.start_time,
                b.end_time,
                b.type,
                b.status,
                b.offer_amount,
                b.google_event_id,
                b.updated_at,
                p.username as client_username,
                p.display_name as client_name,
                v.name as venue_name
             FROM bookings b
             LEFT JOIN profiles p ON p.id = b.sender_id
             LEFT JOIN venues v ON v.id = b.venue_id
             WHERE b.studio_owner_id = $1
             AND b.status IN ('Confirmed', 'Pending', 'Completed')
             AND b.date >= NOW() - INTERVAL '7 days'
             ORDER BY b.date ASC, b.start_time ASC`,
            [studioId]
        );

        const bookings = bookingsResult;

        for (const booking of bookings) {
            try {
                const eventData = {
                    summary: booking.venue_name
                        ? `${booking.type} - ${booking.venue_name}`
                        : `${booking.type} Session`,
                    description: `Client: ${booking.client_name || booking.client_username}\n` +
                        `Type: ${booking.type}\n` +
                        `Status: ${booking.status}\n` +
                        `Amount: $${booking.offer_amount || 'TBD'}\n` +
                        `Booking ID: ${booking.id}`,
                    start: {
                        dateTime: new Date(`${booking.date}T${booking.start_time}`).toISOString(),
                        timeZone: 'UTC'
                    },
                    end: {
                        dateTime: new Date(`${booking.date}T${booking.end_time}`).toISOString(),
                        timeZone: 'UTC'
                    },
                    extendedProperties: {
                        private: {
                            bookingId: booking.id,
                            studioId: studioId
                        }
                    }
                };

                let response;
                const calendarId = syncSettings.calendar_id || 'primary';

                if (booking.google_event_id) {
                    // Update existing event
                    response = await fetch(
                        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${booking.google_event_id}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${syncSettings.access_token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(eventData)
                        }
                    );
                } else {
                    // Create new event
                    response = await fetch(
                        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${syncSettings.access_token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(eventData)
                        }
                    );

                    if (response.ok) {
                        const event = await response.json();
                        // Update booking with Google event ID
                        await query(
                            'UPDATE bookings SET google_event_id = $1 WHERE id = $2',
                            [event.id, booking.id]
                        );
                    }
                }

                if (response.ok) {
                    result.synced++;
                } else {
                    const errorData = await response.json();
                    result.errors.push({
                        bookingId: booking.id,
                        message: errorData.error?.message || 'Failed to sync event'
                    });
                }
            } catch (error) {
                result.errors.push({
                    bookingId: booking.id,
                    message: error.message
                });
            }
        }
    } catch (error) {
        result.errors.push({
            type: 'general',
            message: error.message
        });
    }

    return result;
}

/**
 * Sync events FROM Google Calendar
 */
async function syncFromGoogleCalendar(studioId, syncSettings) {
    const result = { synced: 0, conflicts: [], errors: [] };

    try {
        const calendarId = syncSettings.calendar_id || 'primary';
        const timeMin = new Date();
        const timeMax = new Date();
        timeMax.setMonth(timeMax.getMonth() + 3); // Sync 3 months ahead

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
            `timeMin=${timeMin.toISOString()}&` +
            `timeMax=${timeMax.toISOString()}&` +
            `singleEvents=true&` +
            `orderBy=startTime`,
            {
                headers: {
                    'Authorization': `Bearer ${syncSettings.access_token}`,
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Google Calendar API error: ${response.status}`);
        }

        const data = await response.json();
        const events = data.items || [];

        for (const event of events) {
            try {
                // Check if this is a SeshNx booking (has bookingId in extended properties)
                const bookingId = event.extendedProperties?.private?.bookingId;

                if (bookingId) {
                    // This is a SeshNx booking, check for conflicts
                    const bookingResult = await query(
                        `SELECT id, date, start_time, end_time, status
                         FROM bookings WHERE id = $1`,
                        [bookingId]
                    );

                    if (bookingResult.length > 0) {
                        const booking = bookingResult[0];
                        const eventStart = new Date(event.start.dateTime);
                        const bookingStart = new Date(`${booking.date}T${booking.start_time}`);

                        // Check if times match (within 5 minutes tolerance)
                        const timeDiff = Math.abs(eventStart - bookingStart) / 1000 / 60;

                        if (timeDiff > 5) {
                            // Conflict detected
                            result.conflicts.push({
                                bookingId,
                                bookingTime: `${booking.date} ${booking.start_time}`,
                                googleEventTime: event.start.dateTime,
                                message: 'Time mismatch between booking and calendar event'
                            });
                        }
                    }
                } else {
                    // This is a Google Calendar event not from SeshNx
                    // Check if it conflicts with any existing booking
                    const eventStart = new Date(event.start.dateTime);
                    const eventEnd = new Date(event.end.dateTime);

                    const conflictResult = await query(
                        `SELECT id, date, start_time, end_time
                         FROM bookings
                         WHERE studio_owner_id = $1
                         AND date = DATE($2)
                         AND (
                             (start_time < $3::time AND end_time > $2::time) OR
                             (start_time >= $2::time AND start_time < $3::time)
                         )
                         AND status IN ('Confirmed', 'Pending')`,
                        [
                            studioId,
                            eventStart.toISOString().split('T')[0],
                            eventEnd.toTimeString().slice(0, 5),
                            eventStart.toTimeString().slice(0, 5)
                        ]
                    );

                    if (conflictResult.length > 0) {
                        result.conflicts.push({
                            googleEventTitle: event.summary,
                            googleEventTime: event.start.dateTime,
                            conflictingBookings: conflictResult.map(b => ({
                                id: b.id,
                                time: `${b.date} ${b.start_time} - ${b.end_time}`
                            })),
                            message: 'Google Calendar event conflicts with existing booking'
                        });
                    }
                }
            } catch (error) {
                result.errors.push({
                    eventId: event.id,
                    message: error.message
                });
            }
        }
    } catch (error) {
        result.errors.push({
            type: 'general',
            message: error.message
        });
    }

    return result;
}
