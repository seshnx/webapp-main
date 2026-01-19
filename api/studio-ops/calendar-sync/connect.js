import { query } from '../../../src/config/neon.js';

/**
 * Connect Google Calendar to Studio
 * POST /api/studio-ops/calendar-sync/connect
 *
 * Body:
 * - studioId: Studio UUID (required)
 * - accessToken: Google OAuth access token (required)
 * - refreshToken: Google OAuth refresh token (optional)
 * - calendarId: Google Calendar ID to sync with (optional, defaults to primary)
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { studioId, accessToken, refreshToken, calendarId } = req.body;

        // Validation
        if (!studioId || !accessToken) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['studioId', 'accessToken']
            });
        }

        // Check if studio exists
        const studioResult = await query(
            'SELECT id FROM profiles WHERE id = $1 AND account_types @> $2',
            [studioId, ['Studio']]
        );

        if (studioResult.length === 0) {
            return res.status(404).json({
                error: 'Studio not found'
            });
        }

        // Test the connection by fetching calendar info from Google
        const calendarIdToUse = calendarId || 'primary';
        let calendarInfo = null;

        try {
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${calendarIdToUse}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    return res.status(400).json({
                        error: 'Invalid or expired access token',
                        message: 'Please re-authenticate with Google Calendar'
                    });
                }
                throw new Error(`Google Calendar API error: ${response.status}`);
            }

            calendarInfo = await response.json();
        } catch (error) {
            console.error('Error connecting to Google Calendar:', error);
            return res.status(400).json({
                error: 'Failed to connect to Google Calendar',
                message: error.message
            });
        }

        // Check if sync settings already exist
        const existingResult = await query(
            'SELECT id FROM google_calendar_sync WHERE studio_id = $1',
            [studioId]
        );

        const now = new Date();

        if (existingResult.length > 0) {
            // Update existing connection
            await query(
                `UPDATE google_calendar_sync
                 SET access_token = $1, refresh_token = $2, calendar_id = $3,
                     calendar_name = $4, is_connected = true, last_synced_at = $3,
                     updated_at = NOW()
                 WHERE studio_id = $6`,
                [accessToken, refreshToken || null, calendarIdToUse, calendarInfo.summary, now, studioId]
            );
        } else {
            // Create new connection
            await query(
                `INSERT INTO google_calendar_sync
                 (studio_id, access_token, refresh_token, calendar_id, calendar_name,
                  is_connected, last_synced_at, sync_settings, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, true, $6, $7, NOW(), NOW())`,
                [
                    studioId,
                    accessToken,
                    refreshToken || null,
                    calendarIdToUse,
                    calendarInfo.summary,
                    now,
                    { bidirectionalSync: true, syncInterval: 15 } // Default settings
                ]
            );
        }

        return res.status(200).json({
            success: true,
            data: {
                calendarId: calendarIdToUse,
                calendarName: calendarInfo.summary,
                isConnected: true
            },
            message: 'Google Calendar connected successfully'
        });
    } catch (error) {
        console.error('Error connecting Google Calendar:', error);
        return res.status(500).json({
            error: 'Failed to connect Google Calendar',
            message: error.message
        });
    }
}
